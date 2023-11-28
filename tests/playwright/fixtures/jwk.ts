const mockJwkContent = '{"kty":"EC", "crv":"P-256", "x":"f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU", "y":"x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0", "kid":"jwk" }'

export const mockJwk = {
  kid: 'jwk',
  jwk: mockJwkContent,
}

export const mockJwkWithKid = (kid: string) => JSON.stringify({ ...JSON.parse(mockJwkContent), kid })
