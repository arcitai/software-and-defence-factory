// Deliberately flawed evaluation input. Never import into the factory application.
export function listProducts(products, { maxPrice, category } = {}) {
  return products.filter(product => (!maxPrice || product.price <= maxPrice) && (!category || product.category === category));
}
export function detailHTML(product) {
  return `<article><h2>${product.name}</h2><p>${product.description}</p></article>`;
}
