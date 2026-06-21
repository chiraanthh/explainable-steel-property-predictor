import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.app import app
import json

payload = {
    "Fe": 60.5,
    "c": 0.02,
    "mn": 0.05,
    "si": 0.05,
    "cr": 0.01,
    "ni": 19.7,
    "mo": 2.95,
    "v": 0.01,
    "n": 0,
    "nb": 0.01,
    "co": 15,
    "w": 0,
    "al": 0.15,
    "ti": 1.55
}

def run_tests():
    with TestClient(app) as client:
        print("Testing /predict endpoint...")
        response = client.post("/predict", json=payload)
        if response.status_code == 200:
            print("SUCCESS /predict:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("FAILED /predict:")
            print(response.text)

        print("\nTesting /explain endpoint...")
        response = client.post("/explain", json=payload)
        if response.status_code == 200:
            print("SUCCESS /explain:")
            data = response.json()
            print(f"Base Value: {data.get('base_value')}")
            features = data.get('features', [])
            print(f"Number of features returned: {len(features)}")
            if features:
                print("First feature sample:", json.dumps(features[0], indent=2))
                
            # The dependence data is computed on the frontend, so it's not expected here.
        else:
            print("FAILED /explain:")
            print(response.text)

if __name__ == "__main__":
    run_tests()
