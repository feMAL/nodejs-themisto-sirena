const puppeteer = require('puppeteer');

const setProviderConfig = ( provider ) => {
    let elements = {};

    let mercadolibre = 'mercadolibre';

    elements.url             = 'https://easy.com.ar';
    elements.input           = '.header-userbar-input';
    elements.titleToWait     = '.ad';
    elements.itemsLink       = '.itemhover';
    elements.itemsLink2      = '.yotpo-container';
    elements.itemTitle       = '.prod-title';
    elements.itemPrice       = '.price-e';
    elements.itemImages      = '.fotorama__img';
    elements.itemCategory    = '.breadcrumb_current';
    elements.itemDescription = '.tabs-tables-line1b';

    if ( mercadolibre == provider ){
      elements.url             = 'https://mercadolibre.com.ar';
      elements.input           = '.nav-search-input';
      elements.titleToWait     = '.main-title';
      elements.itemsLink       = '.item__info-title';
      elements.itemsLink2      = '.item__info-title';
      elements.itemTitle       = '.ui-pdp-title';
      elements.itemPrice       = '.price-tag-fraction';
      elements.itemImages      = '.ui-pdp-image';
      elements.itemCategory    = '.andes-breadcrumb__link';
      elements.itemDescription = '.ui-pdp-description__content';
    }
    return elements;
}

module.exports.run = (order_request) => {
    return (async () => {
        let result = [];

        /*const browser = await puppeteer.launch({
          headless: false,
          slowMo: 250 // slow down by 250ms
        });*/

        const browser = await puppeteer.launch();

        const SEARCH_PARAM = order_request.query;
        const PROVIDER_PARAM = order_request.providers;

        let element = setProviderConfig(PROVIDER_PARAM);
  
        const page = await browser.newPage();
        await page.goto(element.url,{
          waitUntil: 'load',
          // Remove the timeout
          timeout: 0
      });
        
        //cargar input de busqueda
        let input = element.input;
        await page.waitForSelector(input);
        await page.type(input, SEARCH_PARAM);
        await (await page.$(input)).press('Enter');

        //Buscar titulos del articulo
        let titleItem = element.titleToWait;
        await page.waitForSelector(titleItem);
        
        let linkItem = element.itemsLink;
        
        let links = await page.$$eval(linkItem, el => el.map ( item => item.getAttribute('href') ) );
  
        if(!links){
          let LinkOther = element.itemsLink2;
          links = await page.$$eval(LinkOther, el => el.map ( item => item.getAttribute('href') ) );
        }

        console.log(links);
        let limit;
        links.length > 5 ? limit = 5 :  limit = links.length

        for(let i = 0; i< limit; i++) {
          await ( async ()=>{
            let product = {};
            let images = [];
            let categories =  []
            
            console.log('por entrar al link link');
          
            await page.goto(links[i],{
              waitUntil: 'load',
              timeout: 0
            });

          console.log('entro al link');
            let titleItem       = element.itemTitle;
            let priceItem       = element.itemPrice;
            let imageItem       = element.itemImages;
            let descriptionItem = element.itemDescription;
            let categoriesItem  = element.itemCategory;

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

            

            if(PROVIDER_PARAM == 'mercadolibre'){
              product.category = await page.$$eval (categoriesItem, el => el.map ( item => item.getAttribute('title') ) )
              .catch( async ( err ) => {
                let newCategory = '.breadcrumb';
                let categoryObj = await page.$$(newCategory);
                return categoryObj;
              });
            }else{
              let category = await page.$eval (categoriesItem, el => el.textContent );
              categories.push(category);
              product.category = categories;
            }
        
            if(PROVIDER_PARAM=='mercadolibre'){
              product.description = await page.$eval ( descriptionItem, el => el.textContent )
              .catch( async ( err ) => {
                let newDescriptionItem = '.item-description__text';
                let descriptionObj     = await page.$(newDescriptionItem)
                  .then( async (obj) => {
                  return await obj.$eval('p', el => el.textContent);
                });
                return descriptionObj;
              } );
            }else{
              product.description= ''
            }
            console.log(product);
            result.push(product);
          })();
        }
        await page.waitFor(1000);
        await browser.close();
        
        return result;
      }) ();
}
