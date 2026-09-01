'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, IdCard, ImagePlus, Printer, ShieldCheck, TriangleAlert } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Details = {
  name: string; designation: string; employeeNo: string; joiningDate: string; bloodGroup: string;
  companyName: string; tagline: string; address: string; website: string; authorityName: string; authorityTitle: string;
};
const initialDetails: Details = {
  name: 'EMPLOYEE NAME', designation: 'Job Designation', employeeNo: '00000', joiningDate: '2025-03-10', bloodGroup: 'B+ve',
  companyName: 'Caprus IT Private Limited', tagline: 'UNLOCKING SMART SOLUTIONS',
  address: '2nd Floor, New Mark House, Patrika Nagar, Madhapur, Hyderabad – 81, Telangana', website: 'www.caprusit.com',
  authorityName: 'Authorized Signatory', authorityTitle: 'Issuing Authority',
};

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number, weight = 700) {
  let size = start;
  do { ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`; size -= 2; } while (ctx.measureText(text).width > maxWidth && size > 34);
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

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, centerX: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.trim().split(/\s+/); const lines: string[] = []; let line = '';
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line);
  lines.slice(0, 3).forEach((value, index) => ctx.fillText(value, centerX, y + index * lineHeight));
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const templateRef = useRef<HTMLImageElement | null>(null);
  const [details, setDetails] = useState(initialDetails);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [signature, setSignature] = useState<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'print' | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const image = new Image(); image.src = '/id-card-template.png';
    image.onload = () => { templateRef.current = image; setReady(true); };
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
    else { ctx.fillStyle = '#1668ad'; fitFont(ctx, details.companyName, 1450, 126, 800); ctx.fillText(details.companyName, 1025, 545); }
    if (details.tagline) { ctx.fillStyle = '#1668ad'; ctx.font = '500 42px Arial'; ctx.fillText(details.tagline.toUpperCase(), 1025, 660); }
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
    fitFont(ctx, details.name.toUpperCase(), 1580, 94, 800); ctx.fillText(details.name.toUpperCase(), 1024, 2028);
    fitFont(ctx, details.designation, 1540, 66, 700); ctx.fillText(details.designation, 1024, 2170);
    ctx.font = '400 60px Arial'; ctx.fillText('Emp.No.:', 790, 2302); ctx.font = '700 68px Arial'; ctx.textAlign = 'left'; ctx.fillText(details.employeeNo || '00000', 930, 2302);
    ctx.font = '600 58px Arial'; ctx.fillText(`D.O.J.: ${formatDate(details.joiningDate)}`, 82, 2500); ctx.fillText(`Blood Group: ${details.bloodGroup || '—'}`, 82, 2618);

    ctx.textAlign = 'center';
    if (signature) drawContainedImage(ctx, signature, 1390, 2310, 530, 160);
    ctx.fillStyle = '#302e2e'; fitFont(ctx, details.authorityName, 610, 48, 700); ctx.fillText(details.authorityName, 1650, 2550);
    ctx.font = '500 46px Arial'; ctx.fillText(details.authorityTitle, 1650, 2630);

    ctx.fillStyle = '#1668ad'; ctx.fillRect(95, 2692, 1860, 18);
    ctx.fillStyle = '#f37032'; fitFont(ctx, details.companyName, 1750, 70, 800); ctx.fillText(details.companyName, 1025, 2835);
    ctx.fillStyle = '#302e2e'; ctx.font = '500 40px Arial'; drawWrappedText(ctx, details.address, 1025, 2935, 1800, 55);
    ctx.fillStyle = '#1668ad'; ctx.fillRect(0, 3160, 2050, 150);
    ctx.fillStyle = '#fff'; fitFont(ctx, details.website, 1750, 68, 800); ctx.fillText(details.website, 1025, 3262);
  }, [details, photo, logo, signature, ready]);

  const update = (key: keyof Details) => (event: ChangeEvent<HTMLInputElement>) => setDetails((current) => ({ ...current, [key]: event.target.value }));
  const clearSampleOnFocus = (key: keyof Details) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.currentTarget.value === initialDetails[key]) setDetails((current) => ({ ...current, [key]: '' }));
  };
  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); const image = new Image();
    image.onload = () => { setPhoto(image); URL.revokeObjectURL(url); }; image.src = url;
  }
  function selectArtwork(setter: (image: HTMLImageElement) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); const image = new Image();
      image.onload = () => { setter(image); URL.revokeObjectURL(url); }; image.src = url;
    };
  }
  function downloadPdf() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    setExporting('pdf'); setNotice(null);
    try {
      const image = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 87], compress: true });
      pdf.addImage(image, 'JPEG', 0, 0, 54, 87, undefined, 'FAST');
      const safeName = (details.name || 'employee').trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      pdf.save(`${safeName}-id-card.pdf`);
      setNotice({ kind: 'success', message: 'PDF downloaded successfully.' });
    } catch (error) {
      console.error('PDF export failed', error);
      setNotice({ kind: 'error', message: 'PDF could not be created. Please refresh the page and try again.' });
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
      const image = canvas.toDataURL('image/jpeg', 0.98);
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
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#f37032]">New employee</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Prepare an ID card</h1><p className="mt-2 text-sm leading-6 text-[#667785]">Upload a clear portrait and enter the approved HR details. The card preview updates instantly.</p></div>
        <div className="mb-5 rounded-xl border border-dashed border-[#9db8cc] bg-[#f5f9fc] p-4"><Label htmlFor="photo" className="flex cursor-pointer items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-[#1668ad] shadow-sm"><ImagePlus size={21} /></span><span><span className="block text-sm font-bold">Employee photograph <span className="text-[#d94c36]">*</span></span><span className="block text-xs font-normal text-[#6c7e8b]">JPG or PNG · portrait photo recommended</span></span></Label><Input id="photo" required type="file" accept="image/png,image/jpeg" onChange={selectPhoto} className="sr-only" /></div>
        <SectionTitle>Employee details</SectionTitle>
        <div className="grid gap-4">
          <Field required label="Full name" id="name"><Input required id="name" value={details.name} onFocus={clearSampleOnFocus('name')} onChange={update('name')} maxLength={32} /></Field>
          <Field required label="Designation" id="designation"><Input required id="designation" value={details.designation} onFocus={clearSampleOnFocus('designation')} onChange={update('designation')} maxLength={42} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field required label="Employee number" id="employeeNo"><Input required id="employeeNo" value={details.employeeNo} onFocus={clearSampleOnFocus('employeeNo')} onChange={update('employeeNo')} maxLength={14} /></Field><Field required label="Date of joining" id="joiningDate"><Input required id="joiningDate" type="date" value={details.joiningDate} onFocus={clearSampleOnFocus('joiningDate')} onChange={update('joiningDate')} /></Field></div>
          <Field required label="Blood group" id="bloodGroup"><Input required id="bloodGroup" value={details.bloodGroup} onFocus={clearSampleOnFocus('bloodGroup')} onChange={update('bloodGroup')} placeholder="e.g. B+ve" maxLength={8} /></Field>
        </div>

        <SectionTitle>Company branding</SectionTitle>
        <div className="grid gap-4">
          <UploadField id="logo" label="Company logo" note="Optional PNG or JPG; company name is used when omitted"><Input id="logo" type="file" accept="image/png,image/jpeg" onChange={selectArtwork(setLogo)} className="sr-only" /></UploadField>
          <Field required label="Company name" id="companyName"><Input required id="companyName" value={details.companyName} onFocus={clearSampleOnFocus('companyName')} onChange={update('companyName')} maxLength={48} /></Field>
          <Field label="Tagline" id="tagline"><Input id="tagline" value={details.tagline} onFocus={clearSampleOnFocus('tagline')} onChange={update('tagline')} maxLength={50} /></Field>
          <Field required label="Company address" id="address"><Textarea required id="address" value={details.address} onFocus={clearSampleOnFocus('address')} onChange={(event) => setDetails((current) => ({ ...current, address: event.target.value }))} rows={3} maxLength={180} /></Field>
          <Field required label="Website" id="website"><Input required id="website" value={details.website} onFocus={clearSampleOnFocus('website')} onChange={update('website')} maxLength={55} /></Field>
        </div>

        <SectionTitle>Issuing authority</SectionTitle>
        <div className="grid gap-4">
          <UploadField required id="signature" label="Authority signature" note="Transparent PNG recommended"><Input required id="signature" type="file" accept="image/png,image/jpeg" onChange={selectArtwork(setSignature)} className="sr-only" /></UploadField>
          <Field required label="Authority name" id="authorityName"><Input required id="authorityName" value={details.authorityName} onFocus={clearSampleOnFocus('authorityName')} onChange={update('authorityName')} maxLength={34} /></Field>
          <Field required label="Authority title" id="authorityTitle"><Input required id="authorityTitle" value={details.authorityTitle} onFocus={clearSampleOnFocus('authorityTitle')} onChange={update('authorityTitle')} maxLength={30} /></Field>
        </div>
        {notice && <Alert variant={notice.kind === 'error' ? 'destructive' : 'default'} className={`mt-5 ${notice.kind === 'success' ? 'border-[#9ed4bf] bg-[#f0faf6] text-[#176a4d]' : ''}`}>{notice.kind === 'success' ? <CheckCircle2 /> : <TriangleAlert />}<AlertDescription>{notice.message}</AlertDescription></Alert>}
        <div className="mt-6 grid grid-cols-[1fr_auto] gap-3"><Button type="button" onClick={downloadPdf} disabled={!ready || exporting !== null} className="h-11 bg-[#f37032] font-semibold text-white hover:bg-[#d95f25]"><Download size={17} /> {exporting === 'pdf' ? 'Preparing PDF…' : 'Download print PDF'}</Button><Button type="button" onClick={printCard} disabled={!ready || exporting !== null} variant="outline" className="h-11 px-3" aria-label="Print ID card"><Printer size={17} /></Button></div>
        <p className="mt-3 text-center text-xs text-[#71818d]">Output: 54 × 87 mm · high-resolution portrait PDF</p>
      </form>
      <section className="flex min-h-[620px] flex-col rounded-2xl border border-[#dce5eb] bg-[#e5ecf1] p-4 sm:p-7"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold">Print preview</h2><p className="text-xs text-[#647585]">Based on your supplied Photoshop artwork</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1668ad] shadow-sm">Front side</span></div><div className="grid flex-1 place-items-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,#f8fafb_0,#dbe4ea_100%)] p-4 sm:p-7"><canvas ref={canvasRef} width={2050} height={3310} aria-label="Employee ID card preview" className="h-auto max-h-[calc(100vh-190px)] w-auto max-w-full rounded-[10px] bg-white shadow-[0_24px_70px_rgba(29,52,69,.24)]" /></div></section>
    </section>
  </main>;
}

function Field({ label, id, children, required = false }: { label: string; id: string; children: React.ReactNode; required?: boolean }) { return <div className="grid gap-1.5"><Label htmlFor={id} className={required ? 'text-xs font-bold text-[#263f51]' : 'text-xs font-medium text-[#5c7080]'}>{label}{required && <span className="text-[#d94c36]"> *</span>}</Label>{children}</div>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <div className="mb-3 mt-6 flex items-center gap-3"><h2 className="whitespace-nowrap text-xs font-bold uppercase tracking-[.13em] text-[#1668ad]">{children}</h2><span className="h-px w-full bg-[#dce5eb]" /></div>; }
function UploadField({ id, label, note, children, required = false }: { id: string; label: string; note: string; children: React.ReactNode; required?: boolean }) { return <div className="rounded-xl border border-dashed border-[#b8cad7] bg-[#f8fafc] p-3"><Label htmlFor={id} className="flex cursor-pointer items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-white text-[#1668ad] shadow-sm"><ImagePlus size={18} /></span><span><span className={required ? 'block text-xs font-bold text-[#263f51]' : 'block text-xs font-semibold text-[#425767]'}>{label}{required && <span className="text-[#d94c36]"> *</span>}</span><span className="block text-[11px] font-normal text-[#70818d]">{note}</span></span></Label>{children}</div>; }
