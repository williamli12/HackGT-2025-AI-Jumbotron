import json
import time
import requests
import sys

def replay_timeline(timeline_file: str, backend_url: str = "http://localhost:8001"):
    """Replay a timeline of events to the backend"""
    print("Loading timeline...")
    with open(timeline_file, 'r') as f:
        timeline = json.load(f)
    
    events = timeline['events']
    total_events = len(events)
    
    print(f"Starting replay of {total_events} events...")
    print("Press Ctrl+C to stop")
    
    try:
        for i, event in enumerate(events, 1):
            print(f"\rSending event {i}/{total_events}: {event['event']['type']} at {event['clock']}", end='')
            response = requests.post(f"{backend_url}/ingest", json=event)
            if response.status_code != 200:
                print(f"\nError sending event: {response.status_code}")
                print(response.text)
                continue
            
            # Wait 2 seconds between events for better visibility
            time.sleep(2)
        
        print("\nReplay complete!")
        
    except KeyboardInterrupt:
        print("\nReplay stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\nError during replay: {e}")
        sys.exit(1)

if __name__ == "__main__":
    replay_timeline("demo_timeline.json")