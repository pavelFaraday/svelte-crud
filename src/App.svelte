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
  <form on:submit|preventDefault={onSubmitHandler}>
    <input
      bind:value={product.name}
      type="text"
      placeholder="Product Name"
      name
      id="product-name"
    />
    <textarea
      bind:value={product.decription}
      id="product-description"
      placeholder="Product Description"
      rows="3"
    ></textarea>
    <input
      bind:value={product.imageURL}
      type="url"
      id="product-image-url"
      placeholder="https://faztweb.com/"
    />

    <select bind:value={product.category} id="category">
      <option value="laptops">Laptops</option>
      <option value="peripherials">Peripherials</option>
      <option value="servers">Servers</option>
    </select>

    <button>Save Product</button>
  </form>
</main>

<style>
</style>
