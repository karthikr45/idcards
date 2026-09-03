export type CompanyProfile = {
  id: 'aauti' | 'caprus-digital' | 'caprus-it' | 'mentha';
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
    id: 'aauti', label: 'Aauti', companyName: 'Aauti', tagline: '', footerCompanyName: 'Caprus IT Private Limited',
    footerLine1: '2nd Floor, New Mark House,', footerLine2: 'Plot Nos 48 to 51 & 54 to 57 of Survey Number 78,',
    footerLine3: 'Patrika Nagar, Madhapur, Hyderabad-500 081, Telangana, India.', website: '', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#007bff', logoPath: '/companies/aauti-logo.svg', signaturePath: sharedAuthoritySignaturePath,
  },
  {
    id: 'caprus-digital', label: 'Caprus Digital', companyName: 'Caprus Digital', tagline: '', footerCompanyName: 'Caprus Digital',
    footerLine1: '', footerLine2: '', footerLine3: '', website: '', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#f37032', logoPath: null, signaturePath: sharedAuthoritySignaturePath,
  },
  {
    id: 'caprus-it', label: 'Caprus IT', companyName: 'Caprus IT Private Limited', tagline: 'UNLOCKING SMART SOLUTIONS', footerCompanyName: 'Caprus IT Private Limited',
    footerLine1: '2nd Floor, New Mark House,', footerLine2: 'Plot Nos 48 to 51 & 54 to 57 of Survey Number 78,',
    footerLine3: 'Patrika Nagar, Madhapur, Hyd-81, TS. Ph: 040-4120 7879', website: 'www.caprusit.com', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#f37032', logoPath: null, signaturePath: sharedAuthoritySignaturePath,
  },
  {
    id: 'mentha', label: 'Mentha', companyName: 'Mentha', tagline: '', footerCompanyName: 'Mentha',
    footerLine1: '', footerLine2: '', footerLine3: '', website: '', authorityName: '', authorityTitle: 'Issuing Authority',
    footerCompanyColor: '#f37032', logoPath: null, signaturePath: sharedAuthoritySignaturePath,
  },
];

export const defaultCompanyProfile = companyProfiles.find((profile) => profile.id === 'caprus-it')!;
