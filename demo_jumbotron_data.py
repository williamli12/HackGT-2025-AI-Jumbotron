from pulse_mock import NFLMockClient
import json
from typing import Dict, List, Any
import time

class JumbotronDataDemo:
    def __init__(self):
        self.client = NFLMockClient()
        
    def print_section(self, title: str):
        """Helper to print formatted section headers"""
        print("\n" + "="*50)
        print(f"  {title}")
        print("="*50)

    def format_player_stats(self, player: Dict[str, Any]) -> str:
        """Format player statistics for display"""
        return (f"{player['first_name']} {player['last_name']} "
                f"(#{player.get('jersey_number', 'N/A')}) - {player['position']}\n"
                f"Height: {player.get('height', 'N/A')}, Weight: {player.get('weight', 'N/A')}")

    def demo_basic_data(self):
        """Demonstrate basic API data retrieval"""
        self.print_section("Basic Team Information")
        
        # Get Eagles team info
        eagles = self.client.find_team_by_name("Eagles")
        print(f"Team: {eagles['market']} {eagles['name']}")
        print(f"Venue: {eagles.get('venue_name', 'Lincoln Financial Field')}")
        print(f"Conference: {eagles.get('conference', 'NFC')} | Division: {eagles.get('division', 'East')}")

    def demo_roster_highlights(self):
        """Show key player information useful for a Jumbotron"""
        self.print_section("Key Players Spotlight")
        
        eagles = self.client.find_team_by_name("Eagles")
        
        # Get quarterbacks
        qbs = self.client.get_players_by_position("QB", eagles['id'])
        print("\nQuarterbacks:")
        for qb in qbs:
            print(self.format_player_stats(qb))

        # Get key offensive players
        print("\nKey Offensive Players:")
        for position in ["RB", "WR", "TE"]:
            players = self.client.get_players_by_position(position, eagles['id'])
            if players:
                print(f"\n{position}s:")
                for player in players[:2]:  # Show top 2 players per position
                    print(self.format_player_stats(player))

    def demo_game_presentation(self):
        """Demonstrate game-related data useful for Jumbotron displays"""
        self.print_section("Game Presentation Data")
        
        eagles = self.client.find_team_by_name("Eagles")
        games = self.client.get_team_games(eagles['id'])
        
        if games:
            # Get a specific game
            game = self.client.get_game("NFL_game_s7NlrGA1L1RaSOZNtJ8HHSj8")
            print("\nFeatured Game:")
            print(f"Matchup: {game.get('name', 'TBD')}")
            print(f"Venue: {game.get('venue', {}).get('name', 'TBD')}")
            print(f"Status: {game.get('status', 'Scheduled')}")
            
            # Game statistics (if available)
            if 'scoring' in game:
                print("\nScoring Summary:")
                for quarter, score in game['scoring'].items():
                    print(f"{quarter}: {score}")

    def demo_jumbotron_features(self):
        """Demonstrate data useful for specific Jumbotron features"""
        self.print_section("Jumbotron Feature Data")
        
        eagles = self.client.find_team_by_name("Eagles")
        
        # Player spotlight feature
        print("\n🎯 Player Spotlight Feature")
        hurts = self.client.find_player_by_name("Hurts")
        if hurts:
            player = hurts[0]
            print(f"Featured Player: {player['first_name']} {player['last_name']}")
            print(f"Position: {player['position']}")
            print(f"Jersey: #{player.get('jersey_number', 'N/A')}")
            if 'college' in player:
                print(f"College: {player['college']}")
            
        # Team statistics for graphics
        print("\n📊 Team Statistics Display")
        stats = self.client.get_team_statistics(eagles['id'])
        print(f"Total Players: {stats['total_players']}")
        print("Roster Breakdown:")
        for position, count in stats.get('positions', {}).items():
            print(f"  {position}: {count} players")

    def simulate_live_updates(self):
        """Simulate live data updates for Jumbotron display"""
        self.print_section("Live Data Update Simulation")
        
        print("\nSimulating live game updates (press Ctrl+C to stop)...")
        try:
            for i in range(3):  # Simulate 3 updates
                # Get fresh game data
                game = self.client.get_game("NFL_game_s7NlrGA1L1RaSOZNtJ8HHSj8")
                
                print(f"\nUpdate #{i+1}")
                print(f"Game Status: {game.get('status', 'In Progress')}")
                print(f"Current Score: {game.get('home_points', 0)} - {game.get('away_points', 0)}")
                
                # Simulate some game events
                events = [
                    "🏃 First Down - Eagles",
                    "🏈 Touchdown - Hurts pass to Brown",
                    "🦅 Defense takes the field"
                ]
                print(f"Latest Event: {events[i % len(events)]}")
                
                time.sleep(2)  # Wait 2 seconds between updates
                
        except KeyboardInterrupt:
            print("\nLive update simulation stopped")

def main():
    demo = JumbotronDataDemo()
    
    # Run all demonstrations
    demo.demo_basic_data()
    demo.demo_roster_highlights()
    demo.demo_game_presentation()
    demo.demo_jumbotron_features()
    demo.simulate_live_updates()

if __name__ == "__main__":
    main()
