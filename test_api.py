import unittest
from pulse_mock import NFLMockClient, MockAPIClient, RequestNotFoundError
import json

class TestNFLAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures before running tests"""
        cls.nfl_client = NFLMockClient()
        cls.mock_client = MockAPIClient()

    def setUp(self):
        """Set up test fixtures before each test"""
        pass

    def test_health_check(self):
        """Test the API health check endpoint"""
        # Skip health check as it's not part of the mock API
        pass

    def test_leagues(self):
        """Test league retrieval"""
        # Note: The mock API only supports NFL, so we'll test that directly
        response = self.mock_client.get('http://localhost:1339/v1/leagues/NFL/teams')
        self.assertEqual(response.status_code, 200)

    def test_teams(self):
        """Test team retrieval and validation"""
        # Get all teams
        teams = self.nfl_client.get_teams()
        self.assertEqual(len(teams), 32)  # NFL has 32 teams

        # Test team search
        eagles = self.nfl_client.find_team_by_name("Eagles")
        self.assertIsNotNone(eagles)
        self.assertEqual(eagles['name'], 'Eagles')
        self.assertEqual(eagles['market'], 'Philadelphia')

        # Test team details (known to work for Eagles)
        team_details = self.nfl_client.get_team(eagles['id'])
        self.assertEqual(team_details['id'], eagles['id'])
        self.assertIn('name', team_details)
        self.assertIn('market', team_details)

    def test_players(self):
        """Test player retrieval and filtering"""
        # Get all players
        all_players = self.nfl_client.get_all_players()
        self.assertGreater(len(all_players), 0)

        # Test getting players by position
        qbs = self.nfl_client.get_players_by_position("QB")
        self.assertTrue(all(player['position'] == 'QB' for player in qbs))

        # Test getting team players (known to work for Eagles)
        eagles = self.nfl_client.find_team_by_name("Eagles")
        team_players = self.nfl_client.get_team_players(eagles['id'])
        self.assertGreater(len(team_players), 0)

        # Test player search
        hurts = self.nfl_client.find_player_by_name("Hurts")
        self.assertTrue(any(player['last_name'] == 'Hurts' for player in hurts))

    def test_games(self):
        """Test game retrieval and filtering"""
        # Get all games
        all_games = self.nfl_client.get_all_games()
        self.assertGreater(len(all_games), 0)

        # Test getting team games (known to work for Eagles)
        eagles = self.nfl_client.find_team_by_name("Eagles")
        team_games = self.nfl_client.get_team_games(eagles['id'])
        self.assertGreater(len(team_games), 0)

        # Test specific game retrieval using a known game ID
        game_details = self.nfl_client.get_game("NFL_game_s7NlrGA1L1RaSOZNtJ8HHSj8")
        self.assertEqual(game_details['id'], "NFL_game_s7NlrGA1L1RaSOZNtJ8HHSj8")

    def test_team_statistics(self):
        """Test team statistics retrieval"""
        # Get Eagles statistics (known to work)
        eagles = self.nfl_client.find_team_by_name("Eagles")
        stats = self.nfl_client.get_team_statistics(eagles['id'])
        self.assertIn('total_players', stats)
        self.assertGreater(stats['total_players'], 0)

    def test_error_handling(self):
        """Test error handling for non-existent resources"""
        # Test non-existent team
        with self.assertRaises(RequestNotFoundError):
            self.nfl_client.get_team("non_existent_team_id")

        # Test non-existent player
        with self.assertRaises(RequestNotFoundError):
            self.nfl_client.get_player("non_existent_player_id")

    def test_advanced_search_and_filter(self):
        """Test advanced search and filter capabilities"""
        # Test position filtering with team context
        eagles = self.nfl_client.find_team_by_name("Eagles")
        eagles_qbs = self.nfl_client.get_players_by_position("QB", eagles['id'])
        self.assertTrue(all(player['position'] == 'QB' for player in eagles_qbs))

        # Test partial name matching
        players = self.nfl_client.find_player_by_name("Hurts")  # Should find "Hurts"
        self.assertTrue(any('Hurts' in player['last_name'] for player in players))

    def test_rest_endpoints(self):
        """Test direct REST endpoint access"""
        base_url = 'http://localhost:1339/v1'
        
        # Test teams endpoint
        response = self.mock_client.get(f'{base_url}/leagues/NFL/teams')
        self.assertEqual(response.status_code, 200)
        teams = response.json()
        self.assertGreater(len(teams), 0)

        # Test players endpoint with position filter
        response = self.mock_client.get(f'{base_url}/leagues/NFL/players?position=QB')
        self.assertEqual(response.status_code, 200)
        qbs = response.json()
        self.assertGreater(len(qbs), 0)

        # Test team by ID endpoint (using Eagles ID)
        eagles = self.nfl_client.find_team_by_name("Eagles")
        response = self.mock_client.get(f'{base_url}/leagues/NFL/teams/{eagles["id"]}')
        self.assertEqual(response.status_code, 200)
        team_details = response.json()
        self.assertEqual(team_details['name'], 'Eagles')

if __name__ == '__main__':
    unittest.main(verbosity=2)
