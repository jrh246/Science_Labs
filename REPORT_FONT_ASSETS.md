# Student report fonts

Reports keep the existing bundled Roboto faces for covered text. The pinned, unmodified DejaVu Sans file in src/assets/fonts supplies extra glyph runs only where a Roboto face lacks coverage. This fixes scientific arrows such as → without replacing original student text or changing ordinary text layout. All four symbol styles intentionally use the same unmodified regular face.

The complete Bitstream/Arev/DejaVu license notice is public/licenses/dejavu-fonts.txt and is also included in the locally bundled VFS next to the font. No Windows Arial font is redistributed. Source: DejaVu Sans packaged with local Matplotlib; pinned SHA256 3fdf69cabf06049ea70a00b5919340e2ce1e6d02b0cc3c4b44fb6801bd1e0d22.

report-symbol-font.js embeds the font/license for first-offline exports. report-text-fonts.js records the additional glyph coverage compared with all four installed pdfmake Roboto faces. These generated files have no runtime Python/fontkit dependency; fontkit is used only to inspect the pinned source font during authoring. The PDF engine registers its family before creating a document.

This provides tested scientific-symbol and current English/Greek/Spanish-character coverage, not complete Unicode or language/complex-script translation approval. AUD-10 still requires reviewed language fonts, shaping and app/print outputs.
