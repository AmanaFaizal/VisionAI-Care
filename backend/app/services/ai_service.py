import google.generativeai as genai
import os

def evaluate_screening(left_score: str, right_score: str, symptoms: list[str], test_type: str = "acuity") -> dict:
    # Rule engine
    recommendation = "no immediate concern"
    factors = []
    
    if test_type == "acuity":
        def parse_acuity(val):
            if not val: return 1.0
            try:
                num, den = val.split('/')
                return int(num) / int(den)
            except:
                return 1.0

        left_val = parse_acuity(left_score)
        right_val = parse_acuity(right_score)
        
        if left_val < 0.5 or right_val < 0.5:
            recommendation = "professional assessment recommended"
            factors.append(f"Reduced visual acuity (Left: {left_score}, Right: {right_score})")
        elif left_val < 0.8 or right_val < 0.8:
            if recommendation != "professional assessment recommended":
                recommendation = "consider consulting a doctor"
            factors.append(f"Slightly reduced visual acuity (Left: {left_score}, Right: {right_score})")
            
        if abs(left_val - right_val) > 0.2:
            if recommendation != "professional assessment recommended":
                recommendation = "consider consulting a doctor"
            factors.append("Significant difference in vision between left and right eyes")
    elif test_type == "color":
        factors.append(f"Color Blindness Score (Left: {left_score}, Right: {right_score})")
        if (left_score and "Possible" in left_score) or (right_score and "Possible" in right_score) or \
           (left_score and left_score.split('/')[0] != left_score.split('/')[1].split()[0]): # e.g. 2/3 Plates
            recommendation = "consider consulting a doctor"
            factors.append("Possible color deficiency detected.")
    elif test_type == "astigmatism":
        factors.append("Astigmatism test completed.")
        # If it returned "Astigmatism Test" with 0 correct responses, it means they have it (as per scoring_service)
        if left_score or right_score: # just assume if they took it, they might have issues if flag was set
            pass # the scoring service flag is saved, AI just sees they took it. Let's rely on symptoms.
    elif test_type == "contrast":
        factors.append(f"Contrast Sensitivity Score (Left: {left_score}, Right: {right_score})")
        if (left_score and left_score.split('/')[0] < '4') or (right_score and right_score.split('/')[0] < '4'):
            recommendation = "consider consulting a doctor"
            factors.append("Reduced contrast sensitivity detected.")

    concerning_symptoms = ["sudden vision loss", "eye pain", "flashes of light"]
    mild_symptoms = ["blurred vision", "headaches", "eye strain"]
    
    for sym in symptoms:
        if sym.lower() in concerning_symptoms:
            recommendation = "professional assessment recommended"
            factors.append(f"Concerning symptom reported: {sym}")
        elif sym.lower() in mild_symptoms:
            if recommendation == "no immediate concern":
                recommendation = "consider consulting a doctor"
            factors.append(f"Reported symptom: {sym}")

    if not factors:
        factors.append("Normal visual acuity and no concerning symptoms reported.")
        
    explanation = _generate_explanation(recommendation, factors)
    
    return {
        "recommendation": recommendation,
        "contributing_factors": factors,
        "explanation": explanation
    }

def _generate_explanation(recommendation: str, factors: list[str]) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return f"Based on your results ({', '.join(factors)}), the recommendation is: {recommendation}."

    genai.configure(api_key=api_key)
    prompt = f"""
    You are an AI assistant for a vision screening system.
    The system's rule engine has determined the following:
    Recommendation: {recommendation}
    Contributing factors: {', '.join(factors)}
    
    Write a brief, plain-language explanation for the patient explaining this recommendation based ONLY on the contributing factors. 
    Do NOT provide a diagnosis. Do not make up any medical claims. 
    Be reassuring but clear. Max 3 sentences.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Based on your results ({', '.join(factors)}), the recommendation is: {recommendation}."
