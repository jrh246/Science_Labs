import pdfMake from 'pdfmake/build/pdfmake.js';
import fonts from 'pdfmake/build/vfs_fonts.js';

pdfMake.addVirtualFileSystem(fonts);

// This module and its fonts are bundled locally and precached for offline use.
export async function downloadReportPdf(definition,filename){
 const blob=await pdfMake.createPdf(definition).getBlob();
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=filename;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
