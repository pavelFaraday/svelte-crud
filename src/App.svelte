<script>
  let product = {
    id: "",
    name: "",
    decription: "",
    category: "",
    imageURL: "",
  };

  const onSubmitHandler = (e) => {
    console.log(product);
  };
</script>

<main>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <!-- First Column -->
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <form on:submit|preventDefault={onSubmitHandler}>
              <input
                bind:value={product.name}
                type="text"
                placeholder="Product Name"
                name
                id="product-name"
                class="form-control"
              />
              <textarea
                bind:value={product.decription}
                id="product-description"
                placeholder="Product Description"
                rows="3"
                class="form-control"
              ></textarea>
              <input
                bind:value={product.imageURL}
                type="url"
                id="product-image-url"
                placeholder="https://faztweb.com/"
                class="form-control"
              />

              <select
                bind:value={product.category}
                id="category"
                class="form-control"
              >
                <option value="laptops">Laptops</option>
                <option value="peripherials">Peripherials</option>
                <option value="servers">Servers</option>
              </select>

              <button>Save Product</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
</style>
