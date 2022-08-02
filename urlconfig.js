module.exports = class urlconfig {
    constructor() {
        this.CO = 'https://www.continente.pt/pesquisa/?q={0}&start={1}';
        this.COSEARCH = "https://www.continente.pt/on/demandware.store/Sites-continente-Site/default/Search-UpdateGrid?cgid=col-produtos&q={0}&pmin=0%2e01&srule=Continente&start=0&sz={1}";
        this.PD = 'https://www.pingodoce.pt/produtos/marca-propria-pingo-doce/pingo-doce/?query={0}&page=1';
        this.PDSEARCH = 'https://www.pingodoce.pt/wp-content/themes/pingodoce/ajax/pd-ajax.php?action=custom-search&type=product&context=general-product-search&page={1}&query={0}';
        this.AU = 'https://www.auchan.pt/pt/pesquisa?q={0}';
        this.AUSEARCH = 'https://www.auchan.pt/on/demandware.store/Sites-AuchanPT-Site/pt_PT/Search-UpdateGrid?q={0}&prefn1=soldInStores&prefv1=000&start=0&sz={1}';
        this.EL = 'https://www.elcorteingles.pt/supermercado/pesquisar/?term={0}&search=text';
        this.ELSEARCH = 'https://www.elcorteingles.pt/supermercado/pesquisar/{1}/?term=leite&search={0}';
    }
}