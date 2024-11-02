export const fetchRandomWord = async (): Promise<string> => {
    try {
      const response = await fetch('https://random-word-api.vercel.app/api?words=1&length=5');
      const [word] = await response.json();
      return word;
    } catch (error) {
      console.error('Error fetching word:', error);
      return 'ERROR';
    }
  };