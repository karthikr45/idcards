'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, IdCard, ImagePlus, Printer, ShieldCheck, TriangleAlert } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { companyProfiles, defaultCompanyProfile, type CompanyProfile } from '@/data/company-profiles';

type Details = {
  name: string; designation: string; employeeNo: string; joiningDate: string; bloodGroup: string;
  companyName: string; tagline: string; footerCompanyName: string; footerLine1: string; footerLine2: string; footerLine3: string;
  website: string; authorityName: string; authorityTitle: string;
};
type FontChoice = 'Arial' | 'Arial Narrow' | 'Helvetica' | 'Verdana' | 'Georgia' | 'Times New Roman';
type TextStyle = { font: FontChoice; bold: boolean };
type StyleKey = keyof Details;
type AddressKey = 'footerLine1' | 'footerLine2' | 'footerLine3';
type AddressLayout = { size: number; align: 'left' | 'center' | 'right' };
const fontChoices: FontChoice[] = ['Arial', 'Arial Narrow', 'Helvetica', 'Verdana', 'Georgia', 'Times New Roman'];
const fontSizes = [24, 28, 32, 36, 40, 44, 48, 52];
const initialDetails: Details = {
  name: 'EMPLOYEE NAME', designation: 'Job Designation', employeeNo: '00000', joiningDate: '2025-03-10', bloodGroup: 'B+ve',
  companyName: defaultCompanyProfile.companyName, tagline: defaultCompanyProfile.tagline,
  footerCompanyName: defaultCompanyProfile.footerCompanyName, footerLine1: defaultCompanyProfile.footerLine1,
  footerLine2: defaultCompanyProfile.footerLine2, footerLine3: defaultCompanyProfile.footerLine3,
  website: defaultCompanyProfile.website, authorityName: defaultCompanyProfile.authorityName, authorityTitle: defaultCompanyProfile.authorityTitle,
};
const initialTextStyles: Record<StyleKey, TextStyle> = {
  name: { font: 'Helvetica', bold: true }, designation: { font: 'Helvetica', bold: true },
  employeeNo: { font: 'Helvetica', bold: true }, joiningDate: { font: 'Helvetica', bold: true }, bloodGroup: { font: 'Helvetica', bold: true },
  companyName: { font: 'Helvetica', bold: true }, tagline: { font: 'Helvetica', bold: true },
  footerCompanyName: { font: 'Helvetica', bold: true }, footerLine1: { font: 'Helvetica', bold: true }, footerLine2: { font: 'Helvetica', bold: true }, footerLine3: { font: 'Helvetica', bold: true },
  website: { font: 'Helvetica', bold: true }, authorityName: { font: 'Helvetica', bold: true }, authorityTitle: { font: 'Helvetica', bold: true },
};

function canvasFont(style: TextStyle, size: number, weight?: number) {
  return `${weight ?? (style.bold ? 900 : 400)} ${size}px "${style.font}", Arial, Helvetica, sans-serif`;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number, style: TextStyle, minimum = 34) {
  let size = start;
  do { ctx.font = canvasFont(style, size); size -= 2; } while (ctx.measureText(text).width > maxWidth && size > minimum);
}

function formatDate(value: string) {
  if (!value) return 'DD-MMM-YYYY';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replaceAll(' ', '-').toUpperCase();
}

function drawContainedImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.min(w / image.width, h / image.height);
  const width = image.width * scale; const height = image.height * scale;
  ctx.drawImage(image, x + (w - width) / 2, y + (h - height) / 2, width, height);
}

function drawTrackedText(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number, maxWidth: number, start: number, style: TextStyle, tracking: number) {
  let size = start; let widths: number[] = []; let total = 0;
  do {
    ctx.font = canvasFont(style, size);
    widths = [...text].map((letter) => ctx.measureText(letter).width); total = widths.reduce((sum, width) => sum + width, 0) + tracking * Math.max(0, text.length - 1); size -= 2;
  } while (total > maxWidth && size > 34);
  ctx.textAlign = 'left'; let x = centerX - total / 2;
  [...text].forEach((letter, index) => { ctx.fillText(letter, x, y); x += widths[index] + tracking; });
}

function drawEmployeeNumber(ctx: CanvasRenderingContext2D, value: string, centerX: number, y: number, style: TextStyle) {
  const label = 'Emp.No.:'; const number = value || '00000'; const gap = 18;
  const labelStyle = { ...style, bold: true };
  ctx.font = canvasFont(labelStyle, 56, 700); const labelWidth = ctx.measureText(label).width;
  ctx.font = canvasFont(style, 68); const numberWidth = ctx.measureText(number).width;
  let x = centerX - (labelWidth + gap + numberWidth) / 2;
  ctx.textAlign = 'left'; ctx.font = canvasFont(labelStyle, 56, 700); ctx.fillText(label, x, y);
  x += labelWidth + gap; ctx.font = canvasFont(style, 68); ctx.fillText(number, x, y);
}

function drawLabeledValue(ctx: CanvasRenderingContext2D, label: string, value: string, x: number, y: number, style: TextStyle) {
  const labelStyle = { ...style, bold: true }; const gap = 14;
  ctx.textAlign = 'left'; ctx.font = canvasFont(labelStyle, 54, 700); ctx.fillText(label, x, y);
  const valueX = x + ctx.measureText(label).width + gap;
  ctx.font = canvasFont(style, 59); ctx.fillText(value, valueX, y);
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLImageElement | null>(null);
  const [details, setDetails] = useState(initialDetails);
  const [selectedCompany, setSelectedCompany] = useState(defaultCompanyProfile.id);
  const [textStyles, setTextStyles] = useState(initialTextStyles);
  const [addressLayouts, setAddressLayouts] = useState<Record<AddressKey, AddressLayout>>({
    footerLine1: { size: 44, align: 'center' }, footerLine2: { size: 44, align: 'center' }, footerLine3: { size: 44, align: 'center' },
  });
  const [footerCompanyColor, setFooterCompanyColor] = useState(defaultCompanyProfile.footerCompanyColor);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [signature, setSignature] = useState<HTMLImageElement | null>(null);
  const [photoFileName, setPhotoFileName] = useState('No employee photo selected');
  const [logoFileName, setLogoFileName] = useState('Saved company logo');
  const [signatureFileName, setSignatureFileName] = useState('Shared authority signature');
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'png' | 'print' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const image = new Image(); image.src = '/id-card-template.png';
    image.onload = () => { templateRef.current = image; setReady(true); };
    loadProfileArtwork(defaultCompanyProfile.logoPath, setLogo);
    loadProfileArtwork(defaultCompanyProfile.signaturePath, setSignature);
  }, []);

  useEffect(() => {
    if (!ready || !canvasRef.current || !templateRef.current) return;
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.drawImage(templateRef.current, 0, 0, 2050, 3310);
    ctx.fillStyle = '#fff';
    ctx.fillRect(250, 285, 1550, 440); ctx.fillRect(610, 770, 828, 1060); ctx.fillRect(210, 1882, 1628, 440);
    ctx.fillRect(70, 2380, 1260, 285); ctx.fillRect(1300, 2290, 700, 385); ctx.fillRect(0, 2680, 2050, 630);

    ctx.textAlign = 'center';
    if (logo) drawContainedImage(ctx, logo, 360, 330, 1330, 290);
    else { ctx.fillStyle = '#1668ad'; fitFont(ctx, details.companyName, 1450, 126, textStyles.companyName); ctx.fillText(details.companyName, 1025, 545); }
    if (details.tagline) { ctx.fillStyle = '#1668ad'; ctx.font = canvasFont(textStyles.tagline, 42); ctx.fillText(details.tagline.toUpperCase(), 1025, 660); }
    if (photo) {
      const box = { x: 620, y: 780, w: 808, h: 1040 };
      const scale = Math.max(box.w / photo.width, box.h / photo.height); const width = photo.width * scale; const height = photo.height * scale;
      ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
      ctx.drawImage(photo, box.x + (box.w - width) / 2, box.y + (box.h - height) / 2, width, height); ctx.restore();
    } else {
      ctx.fillStyle = '#f3f6f8'; ctx.fillRect(620, 780, 808, 1040); ctx.fillStyle = '#b6c0c8'; ctx.font = '600 42px Arial'; ctx.textAlign = 'center'; ctx.fillText('UPLOAD EMPLOYEE PHOTO', 1024, 1310);
    }
    ctx.strokeStyle = '#494949'; ctx.lineWidth = 10; ctx.strokeRect(610, 770, 828, 1060);
    ctx.fillStyle = '#302e2e'; ctx.textAlign = 'center';
    drawTrackedText(ctx, details.name.toUpperCase(), 1024, 2025, 1580, 86, textStyles.name, 1);
    ctx.textAlign = 'center'; fitFont(ctx, details.designation, 1450, 62, textStyles.designation); ctx.fillText(details.designation, 1024, 2166);
    drawEmployeeNumber(ctx, details.employeeNo, 1024, 2296, textStyles.employeeNo);
    drawLabeledValue(ctx, 'D.O.J.:', formatDate(details.joiningDate), 82, 2496, textStyles.joiningDate);
    drawLabeledValue(ctx, 'Blood Group:', details.bloodGroup || '—', 82, 2612, textStyles.bloodGroup);

    ctx.textAlign = 'center';
    if (signature) drawContainedImage(ctx, signature, 1390, 2380, 530, 170);
    ctx.fillStyle = '#302e2e';
    if (details.authorityName) { fitFont(ctx, details.authorityName, 610, 42, textStyles.authorityName); ctx.fillText(details.authorityName, 1650, 2570); }
    ctx.font = canvasFont(textStyles.authorityTitle, 46); ctx.fillText(details.authorityTitle, 1650, details.authorityName ? 2630 : 2610);

    ctx.fillStyle = '#1668ad'; ctx.fillRect(95, 2692, 1860, 18);
    ctx.fillStyle = footerCompanyColor; fitFont(ctx, details.footerCompanyName, 1750, 68, textStyles.footerCompanyName); ctx.fillText(details.footerCompanyName, 1025, 2828);
    const addressX = (align: AddressLayout['align']) => align === 'left' ? 30 : align === 'right' ? 2020 : 1025;
    ctx.fillStyle = '#302e2e'; ctx.textAlign = addressLayouts.footerLine1.align; ctx.font = canvasFont(textStyles.footerLine1, addressLayouts.footerLine1.size); ctx.fillText(details.footerLine1, addressX(addressLayouts.footerLine1.align), 2928);
    ctx.textAlign = addressLayouts.footerLine2.align; ctx.font = canvasFont(textStyles.footerLine2, addressLayouts.footerLine2.size); ctx.fillText(details.footerLine2, addressX(addressLayouts.footerLine2.align), 2995);
    ctx.textAlign = addressLayouts.footerLine3.align; ctx.font = canvasFont(textStyles.footerLine3, addressLayouts.footerLine3.size); ctx.fillText(details.footerLine3, addressX(addressLayouts.footerLine3.align), 3062);
    ctx.fillStyle = '#1668ad'; ctx.fillRect(0, 3160, 2050, 150);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; fitFont(ctx, details.website, 1750, 64, textStyles.website); ctx.fillText(details.website, 1025, 3258);
  }, [details, textStyles, addressLayouts, footerCompanyColor, photo, logo, signature, ready]);

  const update = (key: keyof Details) => (event: ChangeEvent<HTMLInputElement>) => setDetails((current) => ({ ...current, [key]: event.target.value }));
  const typography = (key: StyleKey) => ({ textStyle: textStyles[key], onTextStyleChange: (next: TextStyle) => setTextStyles((current) => ({ ...current, [key]: next })) });
  const addressControls = (key: AddressKey) => <AddressControls value={addressLayouts[key]} onChange={(next) => setAddressLayouts((current) => ({ ...current, [key]: next }))} label={key === 'footerLine1' ? 'Address line 1' : key === 'footerLine2' ? 'Address line 2' : 'Address line 3'} />;
  const clearSampleOnFocus = (key: keyof Details) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.currentTarget.value === initialDetails[key]) setDetails((current) => ({ ...current, [key]: '' }));
  };
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    loadUploadedArtwork(file, setPhoto, setPhotoFileName);
  }
  function selectArtwork(setter: (image: HTMLImageElement) => void, setFileName: (name: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]; if (!file) return;
      loadUploadedArtwork(file, setter, setFileName);
    };
  }
  function loadUploadedArtwork(file: File, setter: (image: HTMLImageElement) => void, setFileName: (name: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => { setter(image); setFileName(file.name); };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }
  function loadProfileArtwork(path: string | null, setter: (image: HTMLImageElement | null) => void) {
    if (!path) { setter(null); return; }
    const image = new Image(); image.onload = () => setter(image); image.onerror = () => setter(null); image.src = path;
  }
  function selectCompany(profileId: string) {
    const profile = companyProfiles.find((item) => item.id === profileId); if (!profile) return;
    setSelectedCompany(profile.id);
    setDetails((current) => ({ ...current, companyName: profile.companyName, tagline: profile.tagline, footerCompanyName: profile.footerCompanyName, footerLine1: profile.footerLine1, footerLine2: profile.footerLine2, footerLine3: profile.footerLine3, website: profile.website, authorityName: profile.authorityName, authorityTitle: profile.authorityTitle }));
    setFooterCompanyColor(profile.footerCompanyColor);
    loadProfileArtwork(profile.logoPath, setLogo); loadProfileArtwork(profile.signaturePath, setSignature);
    setLogoFileName(profile.logoPath ? `${profile.label} saved logo` : 'No saved logo');
    setSignatureFileName('Shared authority signature');
  }
  function downloadPdf() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    setExporting('pdf'); setNotice(null);
    try {
      const image = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 87], compress: true });
      pdf.addImage(image, 'PNG', 0, 0, 54, 87, undefined, 'FAST');
      const safeName = (details.name || 'employee').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      pdf.save(`${safeName}-id-card.pdf`);
      setNotice({ kind: 'success', message: 'PDF downloaded successfully.' });
    } catch (error) {
      console.error('PDF export failed', error);
      setNotice({ kind: 'error', message: 'PDF could not be created. Please refresh the page and try again.' });
    } finally { setExporting(null); }
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    setExporting('png'); setNotice(null);
    try {
      const safeName = (details.name || 'employee').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const link = document.createElement('a');
      link.download = `${safeName}-id-card-2050x3310.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setNotice({ kind: 'success', message: 'Full-resolution PNG downloaded successfully.' });
    } catch (error) {
      console.error('PNG export failed', error);
      setNotice({ kind: 'error', message: 'PNG could not be created. Please refresh the page and try again.' });
    } finally { setExporting(null); }
  }

  function printCard() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    setExporting('print'); setNotice(null);
    const printWindow = window.open('', '_blank', 'width=720,height=900');
    if (!printWindow) {
      setExporting(null);
      setNotice({ kind: 'error', message: 'Printing was blocked. Please allow pop-ups for this site and try again.' });
      return;
    }
    try {
      const image = canvas.toDataURL('image/png');
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><title>Print employee ID card</title><style>@page{size:54mm 87mm;margin:0}html,body{margin:0;width:54mm;height:87mm}img{display:block;width:54mm;height:87mm;object-fit:fill}@media screen{body{margin:20px auto;box-shadow:0 10px 35px #0003}}</style></head><body><img src="${image}" alt="Employee ID card"></body></html>`);
      printWindow.document.close();
      const output = printWindow.document.querySelector('img');
      if (output) output.onload = () => { printWindow.focus(); printWindow.print(); };
      setNotice({ kind: 'success', message: 'Print window opened at 54 × 87 mm.' });
    } catch (error) {
      console.error('Print failed', error); printWindow.close();
      setNotice({ kind: 'error', message: 'The print window could not be prepared. Please refresh and try again.' });
    } finally { setExporting(null); }
  }

  return <main className="min-h-screen bg-[#f1f5f8] text-[#17222d]">
    <header className="border-b border-[#dce5eb] bg-white px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-[1440px] items-center justify-between">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#1668ad] text-white"><IdCard size={22} /></span><div><p className="text-lg font-bold tracking-tight">Caprus ID Studio</p><p className="text-xs text-[#647585]">HR card preparation workspace</p></div></div>
      <div className="hidden items-center gap-2 text-sm font-medium text-[#4f6473] sm:flex"><ShieldCheck size={17} className="text-[#1e8b66]" /> Process locally in your browser</div>
    </div></header>
    <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[minmax(340px,430px)_minmax(0,1fr)] lg:px-8">
      <form className="h-fit rounded-2xl border border-[#dce5eb] bg-white p-5 shadow-sm" onSubmit={(event) => event.preventDefault()}>
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f37032]">New employee</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Prepare an ID card</h1><p className="mt-2 text-sm leading-6 text-[#667785]">Upload a clear portrait and enter the approved HR details. Choose a font and use <strong>B</strong> beside any field to control its printed style.</p></div>
        <div className="mb-5 grid gap-1.5"><Label htmlFor="companyProfile" className="text-xs font-bold text-[#263f51]">Company <span className="text-[#d94c36]">*</span></Label><NativeSelect id="companyProfile" aria-label="Company profile" value={selectedCompany} onChange={(event) => selectCompany(event.target.value)} className="h-11 font-semibold">{companyProfiles.map((profile: CompanyProfile) => <NativeSelectOption key={profile.id} value={profile.id}>{profile.label}</NativeSelectOption>)}</NativeSelect><p className="text-[11px] text-[#70818d]">Loads the saved company branding, address, website, and issuing authority.</p></div>
        <div className="mb-5"><UploadField required id="photo" label="Employee photograph" note="JPG or PNG · portrait photo recommended" previewSrc={photo?.src} status={photoFileName}><Input id="photo" required type="file" accept="image/png,image/jpeg" onChange={selectPhoto} className="sr-only" /></UploadField></div>
        <SectionTitle>Employee details</SectionTitle>
        <div className="grid gap-4">
          <Field required label="Full name" id="name" {...typography('name')}><Input required id="name" value={details.name} onFocus={clearSampleOnFocus('name')} onChange={update('name')} maxLength={32} /></Field>
          <Field required label="Designation" id="designation" {...typography('designation')}><Input required id="designation" value={details.designation} onFocus={clearSampleOnFocus('designation')} onChange={update('designation')} maxLength={42} /></Field>
          <Field required label="Employee number" id="employeeNo" {...typography('employeeNo')}><Input required id="employeeNo" value={details.employeeNo} onFocus={clearSampleOnFocus('employeeNo')} onChange={update('employeeNo')} maxLength={14} /></Field>
          <Field required label="Date of joining" id="joiningDate" {...typography('joiningDate')}><Input required id="joiningDate" type="date" value={details.joiningDate} onFocus={clearSampleOnFocus('joiningDate')} onChange={update('joiningDate')} /></Field>
          <Field required label="Blood group" id="bloodGroup" {...typography('bloodGroup')}><Input required id="bloodGroup" value={details.bloodGroup} onFocus={clearSampleOnFocus('bloodGroup')} onChange={update('bloodGroup')} placeholder="e.g. B+ve" maxLength={8} /></Field>
        </div>

        <SectionTitle>Company branding</SectionTitle>
        <div className="grid gap-4">
          <UploadField id="logo" label="Company logo" note="PNG or JPG · click to replace" previewSrc={logo?.src} status={logoFileName}><Input id="logo" type="file" accept="image/png,image/jpeg" onChange={selectArtwork(setLogo, setLogoFileName)} className="sr-only" /></UploadField>
          <Field required label="Company name" id="companyName" {...typography('companyName')}><Input required id="companyName" value={details.companyName} onFocus={clearSampleOnFocus('companyName')} onChange={update('companyName')} maxLength={48} /></Field>
          <Field label="Tagline" id="tagline" {...typography('tagline')}><Input id="tagline" value={details.tagline} onFocus={clearSampleOnFocus('tagline')} onChange={update('tagline')} maxLength={50} /></Field>
        </div>

        <SectionTitle>Footer content</SectionTitle>
        <div className="grid gap-4">
          <Field required label="Footer company name" id="footerCompanyName" color={footerCompanyColor} onColorChange={setFooterCompanyColor} {...typography('footerCompanyName')}><Input required id="footerCompanyName" value={details.footerCompanyName} onFocus={clearSampleOnFocus('footerCompanyName')} onChange={update('footerCompanyName')} maxLength={48} /></Field>
          <Field required label="Address line 1" id="footerLine1" extraControls={addressControls('footerLine1')} {...typography('footerLine1')}><Textarea required id="footerLine1" value={details.footerLine1} onFocus={clearSampleOnFocus('footerLine1')} onChange={(event) => setDetails((current) => ({ ...current, footerLine1: event.target.value.replace(/\n/g, ' ') }))} rows={2} maxLength={100} className="resize-none" /></Field>
          <Field required label="Address line 2" id="footerLine2" extraControls={addressControls('footerLine2')} {...typography('footerLine2')}><Textarea required id="footerLine2" value={details.footerLine2} onFocus={clearSampleOnFocus('footerLine2')} onChange={(event) => setDetails((current) => ({ ...current, footerLine2: event.target.value.replace(/\n/g, ' ') }))} rows={2} maxLength={100} className="resize-none" /></Field>
          <Field required label="Address line 3 / phone" id="footerLine3" extraControls={addressControls('footerLine3')} {...typography('footerLine3')}><Textarea required id="footerLine3" value={details.footerLine3} onFocus={clearSampleOnFocus('footerLine3')} onChange={(event) => setDetails((current) => ({ ...current, footerLine3: event.target.value.replace(/\n/g, ' ') }))} rows={2} maxLength={110} className="resize-none" /></Field>
          <Field required label="Website" id="website" {...typography('website')}><Input required id="website" value={details.website} onFocus={clearSampleOnFocus('website')} onChange={update('website')} maxLength={55} /></Field>
        </div>

        <SectionTitle>Issuing authority</SectionTitle>
        <div className="grid gap-4">
          <UploadField required id="signature" label="Authority signature" note="Transparent PNG recommended · click to replace" previewSrc={signature?.src} status={signatureFileName}><Input id="signature" type="file" accept="image/png,image/jpeg" onChange={selectArtwork(setSignature, setSignatureFileName)} className="sr-only" /></UploadField>
          <Field label="Authority name (optional)" id="authorityName" {...typography('authorityName')}><Input id="authorityName" value={details.authorityName} placeholder="Leave blank to match the original card" onFocus={clearSampleOnFocus('authorityName')} onChange={update('authorityName')} maxLength={34} /></Field>
          <Field required label="Authority title" id="authorityTitle" {...typography('authorityTitle')}><Input required id="authorityTitle" value={details.authorityTitle} onFocus={clearSampleOnFocus('authorityTitle')} onChange={update('authorityTitle')} maxLength={30} /></Field>
        </div>
        {notice && <Alert variant={notice.kind === 'error' ? 'destructive' : 'default'} className={`mt-5 ${notice.kind === 'success' ? 'border-[#9ed4bf] bg-[#f0faf6] text-[#176a4d]' : ''}`}>{notice.kind === 'success' ? <CheckCircle2 /> : <TriangleAlert />}<AlertDescription>{notice.message}</AlertDescription></Alert>}
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3"><Button type="button" onClick={downloadPdf} disabled={!ready || exporting !== null} className="h-11 bg-[#f37032] font-semibold text-white hover:bg-[#d95f25]"><Download size={17} /> {exporting === 'pdf' ? 'Preparing PDF…' : 'Download print PDF'}</Button><Button type="button" onClick={downloadPng} disabled={!ready || exporting !== null} variant="outline" className="h-11 px-3 font-semibold" aria-label="Download full-resolution PNG">{exporting === 'png' ? 'PNG…' : 'PNG'}</Button><Button type="button" onClick={printCard} disabled={!ready || exporting !== null} variant="outline" className="h-11 px-3" aria-label="Print ID card"><Printer size={17} /></Button></div>
        <p className="mt-3 text-center text-xs text-[#71818d]">Lossless output: 54 × 87 mm PDF · 2050 × 3310 px PNG · approximately 960 DPI</p>
      </form>
      <section className="flex min-h-[620px] flex-col rounded-2xl border border-[#dce5eb] bg-[#e5ecf1] p-4 sm:p-7 lg:sticky lg:top-4 lg:self-start"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Print preview</h2><p className="text-xs text-[#647585]">Based on your supplied Photoshop artwork</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1668ad] shadow-sm">Front side</span></div><div className="grid flex-1 place-items-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,#f8fafb_0,#dbe4ea_100%)] p-4 sm:p-7"><canvas ref={canvasRef} width={2050} height={3310} aria-label="Employee ID card preview" className="h-auto max-h-[calc(100vh-190px)] w-auto max-w-full rounded-[10px] bg-white shadow-[0_24px_70px_rgba(29,52,69,.24)]" /></div></section>
    </section>
  </main>;
}

function Field({ label, id, children, required = false, textStyle, onTextStyleChange, color, onColorChange, extraControls }: { label: string; id: string; children: React.ReactNode; required?: boolean; textStyle?: TextStyle; onTextStyleChange?: (style: TextStyle) => void; color?: string; onColorChange?: (color: string) => void; extraControls?: React.ReactNode }) { return <div className="grid gap-1.5"><Label htmlFor={id} className={required ? 'text-xs font-bold text-[#263f51]' : 'text-xs font-medium text-[#5c7080]'}>{label}{required && <span className="text-[#d94c36]"> *</span>}</Label><div className={`grid gap-2 [&>*:first-child]:col-span-full ${color && onColorChange ? 'grid-cols-[minmax(0,1fr)_110px_40px]' : 'grid-cols-[minmax(0,1fr)_40px]'}`}>{children}{textStyle && onTextStyleChange && <><NativeSelect aria-label={`${label} font`} value={textStyle.font} onChange={(event) => onTextStyleChange({ ...textStyle, font: event.target.value as FontChoice })} className="h-9 text-xs">{fontChoices.map((font) => <NativeSelectOption key={font} value={font}>{font}</NativeSelectOption>)}</NativeSelect><Button type="button" variant={textStyle.bold ? 'default' : 'outline'} size="icon" aria-label={`${textStyle.bold ? 'Remove bold from' : 'Make bold'} ${label}`} aria-pressed={textStyle.bold} onClick={() => onTextStyleChange({ ...textStyle, bold: !textStyle.bold })} className={`h-9 w-10 text-base font-black ${textStyle.bold ? 'bg-[#1668ad] text-white hover:bg-[#12558d]' : ''}`}>B</Button></>}{color && onColorChange && <Input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} aria-label={`${label} color`} title="Choose footer company-name color" className="h-9 w-10 cursor-pointer p-1" />}</div>{extraControls}</div>; }
function AddressControls({ value, onChange, label }: { value: AddressLayout; onChange: (value: AddressLayout) => void; label: string }) { return <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#f5f8fa] p-2"><NativeSelect aria-label={`${label} font size`} value={String(value.size)} onChange={(event) => onChange({ ...value, size: Number(event.target.value) })} className="h-8 text-xs">{fontSizes.map((size) => <NativeSelectOption key={size} value={String(size)}>{size}px</NativeSelectOption>)}</NativeSelect><NativeSelect aria-label={`${label} alignment`} value={value.align} onChange={(event) => onChange({ ...value, align: event.target.value as AddressLayout['align'] })} className="h-8 text-xs"><NativeSelectOption value="left">Left</NativeSelectOption><NativeSelectOption value="center">Center</NativeSelectOption><NativeSelectOption value="right">Right</NativeSelectOption></NativeSelect></div>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <div className="mb-3 mt-6 flex items-center gap-3"><h2 className="whitespace-nowrap text-xs font-bold uppercase tracking-[.13em] text-[#1668ad]">{children}</h2><span className="h-px w-full bg-[#dce5eb]" /></div>; }
function UploadField({ id, label, note, children, required = false, previewSrc, status }: { id: string; label: string; note: string; children: React.ReactNode; required?: boolean; previewSrc?: string; status: string }) { return <div className="rounded-xl border border-dashed border-[#9db8cc] bg-[#f5f9fc] p-3"><Label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-lg focus-within:ring-2 focus-within:ring-[#1668ad]"><span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#d7e1e8] bg-white text-[#1668ad] shadow-sm">{previewSrc ? <img src={previewSrc} alt={`${label} preview`} className="h-full w-full object-contain p-1" /> : <ImagePlus size={22} />}</span><span className="min-w-0 flex-1"><span className={required ? 'block text-xs font-bold text-[#263f51]' : 'block text-xs font-semibold text-[#425767]'}>{label}{required && <span className="text-[#d94c36]"> *</span>}</span><span className="mt-0.5 block truncate text-[11px] font-medium text-[#1668ad]">{status}</span><span className="mt-1 block text-[11px] font-normal text-[#70818d]">{note}</span><span className="mt-2 inline-flex rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-[#1668ad] shadow-sm">{previewSrc ? 'Replace image' : 'Choose image'}</span></span></Label>{children}</div>; }
