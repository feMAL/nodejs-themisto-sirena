const puppeteer = require('puppeteer');

const setProviderConfig = ( provider ) => {
    let elements = {};

    let mercadolibre = 'mercadolibre';

    elements.url        = 'https://easy.com.ar';
    elements.input      = '.header-userbar-input';
    elements.itemslinks = '.itemhover';
    elements.itemtitle  = '.prod-title';
    elements.itemprice  = '.price-e';
    elements.itemimages = '.fotorama__img';

    if ( mercadolibre == provider ){
      elements.url        = 'https://mercadolibre.com.ar';
      elements.input      = '.nav-search-input';
      elements.itemslinks = '.item__info-title';
      elements.itemtitle  = '.ui-pdp-title';
      elements.itemprice  = '.price-tag-fraction';
      elements.itemimages = '.ui-pdp-image';
    }
    return elements;
}

module.exports.run = (order_request) => {
    return (async () => {
        let result = [];

        const browser = await puppeteer.launch({
          headless: false,
          slowMo: 250 // slow down by 250ms
        });

        const SEARCH_PARAM = order_request.query;
        const PROVIDER_PARAM = order_request.providers;

        let element = setProviderConfig(PROVIDER_PARAM);
        console.log(element);

        const page = await browser.newPage();
        await page.goto(element.url);
        
        //cargar input de busqueda
        let input = element.input;
        await page.waitForSelector(input);
        await page.type(input, SEARCH_PARAM);
        await (await page.$(input)).press('Enter');

        //Buscar titulos del articulo
        /*let titleItem = '.main-title';
        await page.waitForSelector(titleItem);*/
        
        let linkItem = element.itemslinks;
        let links = await page.$$eval(linkItem, el => el.map ( item => item.getAttribute('href') ) );

        //for(let i = 0; i<links.length ; i++) {
        for(let i = 0; i<2 ; i++) {
          await ( async ()=>{
            let product = {};
            let images = [];

            
            await page.goto(links[i]);

            let titleItem       = element.itemtitle;
            let priceItem       = element.itemprice;
            let imageItem       = element.itemimages;
            let descriptionItem = '.ui-pdp-description__content';
            let categoriesItem  = '.andes-breadcrumb__link';

            await page.waitForSelector(titleItem).catch(err => err );

            product.images = images
            
            product.name = await page.$eval(titleItem, el => el.textContent )
            .catch( async (err) => {
              let newTitle = '.item-title__primary';
              categoriesItem = '.breadcrumb'
              let titleObj = await page.$eval(newTitle, el => el.textContent );
              return titleObj;
            } );
            product.price = await page.$eval (priceItem, el => el.textContent );
            product.images = await page.$$eval (imageItem, el => el.map ( item => item.getAttribute('src') ) ).catch( err=> err );
            product.category = await page.$$eval (categoriesItem, el => el.map ( item => item.getAttribute('title') ) )
            .catch( async ( err ) => {
              let newCategory = '.breadcrumb';
              let categoryObj = await page.$$(newCategory);
              return categoryObj;
            });
            product.description = await page.$eval(descriptionItem, el => el.textContent )
            .catch( async ( err ) => {
              let newDescriptionItem = '.item-description__text';
              let descriptionObj     = await page.$(newDescriptionItem).then( async (obj) => {
                return await obj.$eval('p', el => el.textContent);
              });
              return descriptionObj;
            } );
            
            result.push(product);
          })();
        }
        await page.waitFor(1000);
        await browser.close();
        
        return result;
      }) ();
}
