import { EmailTemplate } from "./types";

export const emailTemplate = (props: EmailTemplate) => {
	const { header, isUpdate, nameReport, payload } = props;
	return `
	<div style="max-width: 100%;">

	${header && `<img src="${header}?width=1200&amp;height=120" alt="Header Y Footer Mesa De Trabajo 1 Copia 2" style="max-width: 100%;">`}
	<p style="text-align: center;">

	<span style="font-family: arial, helvetica, sans-serif;">Se ha ${isUpdate ? "Actualizado" : "creado"
		} un nuevo reporte <span style="text-decoration: underline;">${nameReport.toUpperCase()}</span></span></p>
		
	<ul>

	${payload.companyName && `<li style="text-align: left; font-family: arial, helvetica, sans-serif;"><span style="font-family: arial, helvetica, sans-serif;"><strong>Nombre del Cliente</strong>: ${payload.companyName
		}</span></li>`}

	${payload.numberOrder && `<li style="text-align: left; font-family: arial, helvetica, sans-serif;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span class="grammar correction" data-type="grammar" data-suggestions="[{&quot;value&quot;:&quot;N&uacute;mero&quot;}]" data-rule="NUMERO" data-word="Numero">N&uacute;mero</span> de orden de venta</strong>: ${payload.numberOrder
		}</span></li>`}

	${payload.version && `<li style="text-align: left; font-family: arial, helvetica, sans-serif;"><span style="font-family: arial, helvetica, sans-serif;"><strong><span class="misspelling correction" data-type="misspelling" data-suggestions="[{&quot;value&quot;:&quot;Versi&oacute;n&quot;},{&quot;value&quot;:&quot;Aversi&oacute;n&quot;},{&quot;value&quot;:&quot;Versiona&quot;},{&quot;value&quot;:&quot;Eversi&oacute;n&quot;},{&quot;value&quot;:&quot;Versione&quot;},{&quot;value&quot;:&quot;Versiono&quot;},{&quot;value&quot;:&quot;Version&aacute;&quot;}]" data-rule="MORFOLOGIK_RULE_ES" data-word="Version">Versi&oacute;n</span> del Reporte</strong>:  ${payload.version
		}</span></li>`}

	</ul>	
	</div>	
	`;
}


export const currentDate = () => {
	const now = new Date();
	const day = now.getDate();
	const month = now.getMonth() + 1;
	const year = now.getFullYear();

	const formatoFecha = `${day}/${month}/${year}`;

	return formatoFecha;
}

export const accountabilityAd = {
	user: '53131ca7-5ceb-4ac3-bba8-1fb67c5a8977',
	role: '293f17bd-e59f-4cc5-8ff0-86371eab3854',
	admin: true,
};