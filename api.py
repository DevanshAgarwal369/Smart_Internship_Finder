from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from openai import OpenAI
import os
import random
import uvicorn

# Load environment variables
load_dotenv()
client = OpenAI()

DATABASE_URL = os.getenv("DATABASE_URL")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")

engine = create_engine(DATABASE_URL, future=True, echo=False)
qdrant = QdrantClient(url=QDRANT_URL)


# Pydantic models for request body validation
class UserProfile(BaseModel):
    qualification: str = Field(..., description="The user's educational qualification.")
    skills: str = Field(..., description="A comma-separated list of the user's skills.")
    rural: bool = Field(False, description="Indicates if the user is from a rural district.")
    category: str = Field("GEN", description="The user's social category (e.g., GEN, SC, ST, OBC).")

class InternshipQuery(BaseModel):
    city: str = Field(..., description="The city where the internship is located.")
    query: str = Field(..., description="The user's search query, e.g., 'Software Developer'.")
    user: UserProfile


# FastAPI app instance
app = FastAPI(
    title="InterGenie Internship API",
    description="An API to find and recommend internships based on user profile and query."
)

# ----------------- CORS CONFIGURATION -----------------
# This middleware allows the HTML page to communicate with the API.
origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://pminternshipengine.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.post("/find-internships")
# def find_internships(data: dict):
#     return {"message": "CORS fixed ✅", "data": data}
# In-memory cache for Qdrant collections
qdrant_collections = {}


# ----------------- DATABASE UTILS -----------------
def fetch_internships_by_location(location: str):
    sql = text("""
        SELECT sr_no, company_name, role, stipend, location, duration, 
                skills_required, qualification
        FROM internships
        WHERE location LIKE :loc
    """)
    with engine.connect() as conn:
        result = conn.execute(sql, {"loc": f"%{location}%"}).mappings().all()
    return [dict(r) for r in result]

# ----------------- QDRANT UTILS -----------------
def create_collection_if_needed(collection_name: str):
    if not qdrant.collection_exists(collection_name):
        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
        )
        return True
    return False

def embed_and_store(rows, collection_name: str):
    points = [
        PointStruct(
            id=int(r["sr_no"]),
            vector=client.embeddings.create(
                model="text-embedding-3-small",
                input=f"{r['company_name']} offers a {r['role']} internship in {r['location']} for {r['duration']}. "
                      f"Stipend: {r.get('stipend','N/A')}. Skills required: {r.get('skills_required','Not specified')}. "
                      f"Qualification: {r.get('qualification','Not specified')}."
            ).data[0].embedding,
            payload=r
        ) for r in rows
    ]
    if points:
        qdrant.upsert(collection_name=collection_name, points=points)

def search_internships(query, collection_name: str, top_k=30, diversify_k=20):
    embedding = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding
    
    results = qdrant.search(
        collection_name=collection_name,
        query_vector=embedding,
        limit=top_k,
        with_payload=True
    )
    all_results = [r.payload for r in results]
    selected = random.sample(all_results, min(len(all_results), diversify_k))
    return selected

# ----------------- LLM UTILS -----------------
def filter_with_llm(query_role: str, internships: list, final_count=5):
    internships_text = "\n".join(
        f"[{i+1}] {r['company_name']} - {r['role']} in {r['location']}, "
        f"Skills: {r.get('skills_required','N/A')}, Qualification: {r.get('qualification','N/A')}"
        for i, r in enumerate(internships)
    )
    prompt = f"""
    The user is looking for internships with this role focus: "{query_role}".
    Here are 20 possible internships:
    {internships_text}
    Pick the {final_count} internships that best match the role priority. 
    Consider the title, skills, and qualifications.
    Return ONLY a list of internship numbers (e.g., "1, 4, 7, 12, 18").
    Return a minimum of 5 internship numbers.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are an internship selector AI. Only return IDs of best matching internships."},
                  {"role": "user", "content": prompt}],
        temperature=0
    )
    selected_ids = [int(x.strip()) for x in response.choices[0].message.content.strip().split(',') if x.strip().isdigit()]
    return [internships[i-1] for i in selected_ids if 1 <= i <= len(internships)]

def compare_qualification_with_llm(user_qual: str, required_qual: str) -> float:
    if not required_qual or not user_qual:
        return 0.0

    prompt = f"""
    Compare two qualifications:
    User Qualification: {user_qual}
    Required Qualification: {required_qual}
    Decide if the user's qualification is:
    - Higher (better or more advanced)
    - Equal
    - Lower (less than required)
    Respond ONLY with one word: Higher, Equal, or Lower.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a strict academic evaluator."},
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )
    verdict = response.choices[0].message.content.strip().lower()
    if "higher" in verdict:
        return 0.05
    elif "equal" in verdict:
        return 0.0
    elif "lower" in verdict:
        return -0.05
    return 0.0

def check_eligibility(user: dict, internship: dict, threshold: float = 0.70):
    requirement_text = f"{internship.get('qualification','')} {internship.get('skills_required','')}"
    user_text = f"{user['qualification']} {user['skills']}"
    user_embedding = client.embeddings.create(model="text-embedding-3-small", input=user_text).data[0].embedding
    req_embedding = client.embeddings.create(model="text-embedding-3-small", input=requirement_text).data[0].embedding
    
    dot = sum(u * v for u, v in zip(user_embedding, req_embedding))
    norm_u = sum(u * u for u in user_embedding) ** 0.5
    norm_v = sum(v * v for v in req_embedding) ** 0.5
    base_score = dot / (norm_u * norm_v)

    final_score = base_score
    if user.get("rural"):
        final_score += 0.05
    if user.get("category") in ["SC", "ST", "OBC"]:
        final_score += 0.05

    qual_adjust = compare_qualification_with_llm(user['qualification'], internship.get('qualification', ''))
    final_score += qual_adjust
    eligible = final_score >= threshold
    reason = f"Base={round(base_score,2)}, Adj={round(qual_adjust,2)}, Final={round(final_score,2)}."
    return eligible, round(final_score, 2), reason

def cross_recommendations(query, collection_name, top_k=2):
    related_roles = {
        "ai": ["data science", "machine learning", "nlp", "deep learning"],
        "data science": ["ai", "machine learning", "data analytics"],
        "ml": ["ai", "data science", "computer vision"]
    }
    query_lower = query.lower()
    extras = []
    for key, related in related_roles.items():
        if key in query_lower:
            for role in related:
                results = search_internships(role, collection_name, top_k=top_k)
                extras.extend(results)
            break
    return extras

def generate_llm_answer(user, results_with_eval, extra_results):
    structured_text = "\n".join(
        f"Company: {r['company_name']}, Role: {r['role']}, Location: {r['location']}"
        f"Eligibility: {'✅ Eligible' if e else '❌ Not Eligible'} (score={s}), Reason: {reason}"
        for r, (e, s, reason) in results_with_eval
    )
    extra_text = "\n".join(
        f"{r['company_name']} - {r['role']} in {r['location']}"
        for r in extra_results
    ) if extra_results else "None"

    system_prompt = """You are a helpful career counselor AI assistant named InterGenie. 
Your job is to review internship matches and give short guidance to the student under 100 words.
Always try to give different internship but prioritize the role and don't go out of context.
Give internship even user just ask web development.
"""
    user_prompt = f"""
User profile: {user}
Main internship results:
{structured_text}
Extra related opportunities:
{extra_text}
Give a 4-6 sentence summary:
1. Which roles are best fits
2. Any related fields worth exploring
3. Short motivational advice
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7
    )
    return response.choices[0].message.content.strip()

def route_query(query: str) -> str:
    role_keywords = ["developer", "development", "engineer", "engineering", "internship", "ai", "ml", "data", "science", "scientist", "analytics", "analyst", "marketing", "design", "designer", "graphic", "research", "researcher", "management", "manager", "consulting", "finance", "accounting", "content", "writer", "writing", "editor", "sales", "product", "machine learning"]
    query_lower = query.lower().strip()
    if any(word in query_lower for word in role_keywords) and "internship" not in query_lower:
        return "internship"
    routing_prompt = f"""
    Decide if this user query is about internships/career matching 
    or if it is general conversation.
    Query: "{query}"
    Respond with only one word: "internship" or "general".
    """
    routing_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a strict router."},
                  {"role": "user", "content": routing_prompt}],
        temperature=0
    )
    return routing_response.choices[0].message.content.strip().lower()

# ----------------- API ENDPOINTS -----------------
@app.post("/find-internships")
async def find_internships(request_body: InternshipQuery):
    try:
        city = request_body.city
        query = request_body.query
        user = request_body.user.model_dump()

        collection_name = f"{city.lower()}_internship"
        if collection_name not in qdrant_collections:
            is_new = create_collection_if_needed(collection_name)
            if is_new:
                rows = fetch_internships_by_location(city)
                if not rows:
                    raise HTTPException(status_code=404, detail=f"No internships available for {city}.")
                embed_and_store(rows, collection_name)
            qdrant_collections[collection_name] = True

        route = route_query(query)
        if route == "general":
            system_prompt = "You are InterGenie, a helpful internship assistant. If the user asks something outside internships, politely say you are here only to help them find internships."
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": query}],
                temperature=0.7
            )
            return {"message": response.choices[0].message.content.strip()}

        candidates = search_internships(query, collection_name)
        if not candidates:
            raise HTTPException(status_code=404, detail=f"No relevant internships found for '{query}' in {city}.")

        results = filter_with_llm(query, candidates)
        if not results:
            raise HTTPException(status_code=404, detail=f"No top matching internships found after filtering for '{query}'.")

        formatted_results = []
        results_with_eval = []
        for r in results:
            eligible, score, reason = check_eligibility(user, r)
            formatted_results.append({
                "company_name": r.get('company_name'),
                "role": r.get('role'),
                "location": r.get('location'),
                "stipend": r.get('stipend'),
                "duration": r.get('duration'),
                "skills_required": r.get('skills_required'),
                "qualification": r.get('qualification'),
                "is_eligible": eligible,
                "eligibility_score": score,
                "reason": reason
            })
            results_with_eval.append((r, (eligible, score, reason)))

        extra_results = cross_recommendations(query, collection_name)
        formatted_extras = [
            {"company_name": r.get('company_name'), "role": r.get('role'), "location": r.get('location')}
            for r in extra_results
        ]

        final_answer = generate_llm_answer(user, results_with_eval, extra_results)

        return {
            "main_internships": formatted_results,
            "extra_recommendations": formatted_extras,
            "advice": final_answer
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)