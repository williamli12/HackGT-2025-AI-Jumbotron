// Simple utility to test environment variable loading
import { NFL_API_KEY } from '@env';

export function testEnvLoading() {
  console.log('🔍 Environment Variable Test:');
  console.log('NFL_API_KEY exists:', !!NFL_API_KEY);
  console.log('NFL_API_KEY length:', NFL_API_KEY?.length || 0);
  console.log('NFL_API_KEY value (first 10 chars):', NFL_API_KEY?.substring(0, 10) || 'undefined');
  
  return {
    exists: !!NFL_API_KEY,
    length: NFL_API_KEY?.length || 0,
    isValid: NFL_API_KEY && NFL_API_KEY.length > 10 && !NFL_API_KEY.includes('your_')
  };
}
