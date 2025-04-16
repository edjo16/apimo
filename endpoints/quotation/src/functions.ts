import Big from 'big.js';
import 'jspdf-autotable';
import moment from 'moment';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TExportPDF, TQuotation, TypeLine } from './type';

export const generatePFD = async (input: TExportPDF) => {
  const { files, data } = input;
  console.log('1');
  const [header, footer] = await Promise.all([
    downloadImageAndConvertToUint8Array(`https://test-api-priv.icautomatizados.com/assets/${files.report_header}`),
    downloadImageAndConvertToUint8Array(`https://test-api-priv.icautomatizados.com/assets/${files.report_footer}`),
  ]);
  console.log('2');
  let body: ({ content: string | undefined; colspan?: number } | { content: number | undefined })[][] = [];
  data.items.forEach((vale, i) => {
    if (vale.type === TypeLine.LINE) {
      body.push([{ content: i + 1 }, { content: '' }, { content: vale.description }]);
    } else if (vale.type === TypeLine.PRODUCT) {
      body.push([
        { content: i + 1, colspan: 1 },
        { content: vale.code, colspan: 1 },
        { content: vale.description, colspan: 1 },
        { content: vale.qty, colspan: 1 },
        { content: vale.price?.toFixed(2) + ' $', colspan: 1 },
        { content: Big(Big(vale?.price ?? 0).mul(vale?.qty ?? 0)).toFixed(2) + ' $', colspan: 1 },
      ]);
    }
  });

  const doc = new jsPDF({ format: 'letter' });
  const totalPagesExp = '{total_pages_count_string}';

  const columns = [
    { header: '#', dataKey: 'i' },
    { header: 'Código', dataKey: 'number' },
    { header: 'Descripción', dataKey: 'description' },
    { header: 'Cantidad', dataKey: 'qty' },
    { header: 'Precio', dataKey: 'price' },
    { header: 'Total', dataKey: 'total' },
  ];

  autoTable(doc, {
    startY: 65,
    columns,
    body: [...body],
    rowPageBreak: 'auto',
    styles: { cellPadding: 1, fontSize: 10, font: 'Arial' },
    columnStyles: {
      3: { halign: 'right', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 20 },
    },
    didDrawPage: function (_data) {
      console.log('4');

      // Header
      doc.addImage(header, 'JPEG', 0, 0, 216, 40);
      doc.setFontSize(14).setFont('', 'bold');
      doc.text(`COTIZACIÓN:`, 145, 36);
      doc.setFont('', 'normal');
      doc.text(`${formatNumberToSixDigits(data.id)}`, 180, 36);
      // Data
      const currentPage = doc.internal.getNumberOfPages();
      console.log('5');

      if (currentPage == 1) {
        const columnWidth = 60; // Ancho de cada columna

        // Primera columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Cliente: ', 15, 45);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(data.nameClient.toUpperCase(), 30, 45);

        // Segunda fila
        const leap = 5;
        // Primera columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Código: ', 15, 45 + leap);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(data.codeClient, 30, 45 + leap);

        // Segunda columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Contacto: ', 15 + columnWidth + 15, 45 + leap);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(data.contactClient, 30 + columnWidth + 17, 45 + leap);

        // Tercera columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Fecha: ', 15 + 2 * columnWidth + 23, 45 + leap);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(moment(data.dateCreated).format('DD-MM-yy'), 30 + 2 * columnWidth + 22, 45 + leap);

        // Primera columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Email: ', 15, 45 + leap + 5);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(data.contactEmail ? data.contactEmail.toLocaleLowerCase() : 'No Tiene', 30, 45 + leap + 5);

        // Segunda columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Teléfono: ', 15 + columnWidth + 15, 45 + leap + 5);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(data.contactphone ? data.contactphone.toLocaleLowerCase() : 'No Tiene', 30 + columnWidth + 17, 45 + leap + 5);

        // Tercera columna
        doc.setFontSize(10).setFont('', 'bold');
        doc.text('Válido: ', 15 + 2 * columnWidth + 23, 45 + leap + 5);
        doc.setFontSize(10).setFont('', 'normal');
        doc.text(moment(data.expirationDate).format('DD-MM-yy'), 30 + 2 * columnWidth + 22, 45 + leap + 5);

        const lineY = 45 + leap + 8;
        doc.setLineWidth(0.5).setDrawColor('#016CBE');
        doc.line(5, lineY, 213, lineY);
      }

      console.log('7');

      // Footer
      doc.addImage(footer, 'PNG', 0, 235, 216, 35);
      let str = 'Página ' + currentPage;
      if (typeof doc.putTotalPages === 'function') {
        str = str + ' de ' + totalPagesExp;
      }

      console.log('8');
      doc.setFontSize(10);
      let pageSize = doc.internal.pageSize;
      let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(str, _data.settings.margin.left, pageHeight - 10);
    },
    margin: { top: 50, bottom: 50 },
  });

  console.log('9');

  const discountRate = data.discouter > 0 ? Big(data.discouter).div(100) : 0;
  const discount = data.discouter > 0 ? Big(data.total).times(discountRate) : 0;
  console.log('10', discount);
  const bodylength = 20 * 6;
  const valueY = body.length <= 20 ? doc.lastAutoTable.finalY + bodylength : doc.lastAutoTable.finalY;

  doc.setFontSize(10);
  doc.setFont('', 'bold');
  doc.text('Ejecutivo de Ventas:', 15, valueY + 5).setFont('bold');
  doc.setFont('', 'normal');
  doc.text(capitalizeWords(data.salesEmployee.toLocaleLowerCase()) ?? '', 75, valueY + 5, 'right').setFont('normal');
  doc.setFont('', 'bold');
  doc.text('Subtotal', 155, valueY + 5).setFont('bold');
  doc.setFont('', 'normal');
  doc.text('$ ' + data.subTotal.toFixed(2), 200, valueY + 5, 'right').setFont('normal');
  doc.setFont('', 'bold');
  doc.text('ITBMS', 155, valueY + 10).setFont('bold');
  doc.setFont('', 'normal');
  doc.text('$ ' + data.itbms.toFixed(2), 200, valueY + 10, 'right').setFont('normal');
  doc.setFont('', 'bold');
  doc.text('Descuento', 155, valueY + 15).setFont('bold');
  doc.setFont('', 'normal');
  doc.text('$ ' + discount.toFixed(2), 200, valueY + 15, 'right').setFont('normal');
  doc.setFont('', 'bold');
  doc.text('Total', 155, valueY + 20).setFont('bold');
  doc.setFont('', 'normal');
  doc.text('$ ' + Big(data.total).minus(discount).toFixed(2), 200, valueY + 20, 'right').setFont('normal');
  console.log('11');

  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp);
  }

  const docst = doc.output('blob');

  return docst.stream();
};

export const downloadImageAndConvertToUint8Array = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Error al descargar la imagen. Código de estado: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    return uint8Array;
  } catch (error: any) {
    console.error('Error al descargar la imagen:', error.message);
    throw error;
  }
};

export const calculate = async (data: TQuotation) => {
  return data.items.reduce(
    (acc, current) => {
      const { qty, price, tax, type } = current;
      if (type === TypeLine.LINE) return acc;
      if (!qty || !price || !tax) return acc;

      const priceLine = Big(qty).times(Big(price));
      const taxRate = Big(tax).div(100);
      const taxAmount = priceLine.times(taxRate);

      return {
        total: acc.total.plus(priceLine.plus(taxAmount)),
        itbms: acc.itbms.plus(taxAmount),
        subTotal: acc.subTotal.plus(priceLine),
      };
    },
    { subTotal: Big(0), itbms: Big(0), total: Big(0) }
  ) as unknown as { total: Big; subTotal: Big; itbms: Big };
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, (match) => match.toUpperCase());
};

export const formatNumberToSixDigits = (id: number) => {
  if (isNaN(id) || id < 0 || id > 999999) throw new Error('El número proporcionado no es válido. Debe estar entre 0 y 999999.');

  return id.toString().padStart(6, '0');
};
