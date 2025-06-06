export const getCountries = async (accessToken: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/countries`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data;
};
