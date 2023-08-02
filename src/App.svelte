<script>
  let products = [
    {
      id: 1,
      name: "HP Pavilion",
      decription: "Laptop for house",
      category: "laptop",
    },
    {
      id: 2,
      name: "Mouse Razer",
      decription: "Gaming Mouse",
      category: "peripherials",
    },
  ];

  let product = {
    id: "",
    name: "",
    decription: "",
    category: "",
    imageURL: "",
  };

  const cleanProduct = () => {
    product = {
      id: "",
      name: "",
      decription: "",
      category: "",
      imageURL: "",
    };
  };

  const onSubmitHandler = (e) => {
    const newProduct = {
      id: product.name,
      name: product.name,
      decription: product.decription,
      category: product.category,
      imageURL: product.imageURL,
    };
    products = products.concat(newProduct);
    cleanProduct();
  };
</script>

<main>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        {#each products as product}
          <div class="card mt-2">
            <div class="row">
              <div class="col-md-4">
                {#if !product.imageURL}
                  <img
                    src="images/no_product.png"
                    alt=""
                    class="img-fluid p-2"
                  />
                {:else}
                  <img src={product.imageURL} alt="" class="img-fluid p-2" />
                {/if}
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5>
                    <strong>
                      {product.name}
                    </strong>
                    <span>
                      <small>{product.category}</small>
                    </span>
                  </h5>
                  <p class="card-text">{product.decription}</p>
                  <button class="btn btn-danger">Delete</button>
                  <button class="btn btn-secondary">Edit</button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <form on:submit|preventDefault={onSubmitHandler}>
              <div class="form-group">
                <input
                  bind:value={product.name}
                  type="text"
                  placeholder="Product Name"
                  name
                  id="product-name"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <textarea
                  bind:value={product.decription}
                  id="product-description"
                  placeholder="Product Description"
                  rows="3"
                  class="form-control"
                ></textarea>
              </div>
              <div class="form-group">
                <input
                  bind:value={product.imageURL}
                  type="url"
                  id="product-image-url"
                  placeholder="https://faztweb.com/"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <select
                  bind:value={product.category}
                  id="category"
                  class="form-control"
                >
                  <option value="laptops">Laptops</option>
                  <option value="peripherials">Peripherials</option>
                  <option value="servers">Servers</option>
                </select>
              </div>

              <button class="btn btn-secondary">Save Product</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
</style>
