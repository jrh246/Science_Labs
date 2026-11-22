import pdfMake from 'pdfmake/build/pdfmake.js';
import fonts from 'pdfmake/build/vfs_fonts.js';
import {applyReportPdfFonts} from './report-text-fonts.js';
import {reportSymbolVfs,reportSymbolFamilies} from './report-symbol-font.js';

pdfMake.addVirtualFileSystem({...fonts,...reportSymbolVfs});
pdfMake.addFonts(reportSymbolFamilies);

// This module and its fonts are bundled locally and precached for offline use.
export async function downloadReportPdf(definition,filename){
 const blob=await pdfMake.createPdf(applyReportPdfFonts(definition)).getBlob();
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=filename;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
