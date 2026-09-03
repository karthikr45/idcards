export type CompanyProfile = {
  id: 'aauti' | 'caprus-digital' | 'caprus-it' | 'menthra';
  label: string;
  companyName: string;
  tagline: string;
  footerCompanyName: string;
  footerLine1: string;
  footerLine2: string;
  footerLine3: string;
  website: string;
  authorityName: string;
  authorityTitle: string;
  footerCompanyColor: string;
  logoPath: string | null;
  signaturePath: string | null;
};

export const sharedAuthoritySignaturePath = '/companies/shared-authority-signature.png';

// Add or update a company once here; the form and print card use the same profile.
export const companyProfiles: CompanyProfile[] = [
  {
    id: 'aauti', label: 'Aauti', companyName: 'Aauti', tagline: '', footerCompanyName: 'Aauti Private Limited',
    footerLine1: '2nd Floor, New Mark House,', footerLine2: 'Plot Nos 48 to 51 & 54 to 57 of Survey Number 78,',
    footerLine3: 'Patrika Nagar, Madhapur, Hyderabad-500 081, Telangana, India.', website: 'www.aauti.ai', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#007bff', logoPath: '/companies/aauti-logo.svg', signaturePath: sharedAuthoritySignaturePath,
  },
  {
    id: 'caprus-digital', label: 'Caprus Digital', companyName: 'Caprus Digital', tagline: '', footerCompanyName: 'Caprus Digital Private Limited',
    footerLine1: '2nd Floor, New Mark House,', footerLine2: 'Plot Nos 48 to 51 & 54 to 57 of Survey Number 78,',
    footerLine3: 'Patrika Nagar, Madhapur, Hyderabad-500 081, Telangana, India.', website: 'www.caprusdigital.com', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#f37032', logoPath: '/companies/caprus-digital-logo.png', signaturePath: sharedAuthoritySignaturePath,
  },
  {
    id: 'caprus-it', label: 'Caprus IT', companyName: 'Caprus IT Private Limited', tagline: '', footerCompanyName: 'Caprus IT Private Limited',
    footerLine1: '2nd Floor, New Mark House,', footerLine2: 'Plot Nos 48 to 51 & 54 to 57 of Survey Number 78,',
    footerLine3: 'Patrika Nagar, Madhapur, Hyderabad-500 081, Telangana, India.', website: 'www.caprusit.com', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#f37032', logoPath: '/companies/caprus-it-logo.png', signaturePath: sharedAuthoritySignaturePath,
  },
  {
    id: 'menthra', label: 'Menthra', companyName: 'Menthra', tagline: '', footerCompanyName: 'MENTHRA INDIA Private Limited',
    footerLine1: '1-2-32, 505 A Block, Vertex Sadguru Krupa,', footerLine2: 'Nizampet, Qutubullapur, Hyderabad- 500090, Telangana',
    footerLine3: '', website: 'www.menthra.ai', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#f37032', logoPath: '/companies/menthra-logo.png', signaturePath: sharedAuthoritySignaturePath,
  },
];

export const defaultCompanyProfile = companyProfiles.find((profile) => profile.id === 'caprus-it')!;
