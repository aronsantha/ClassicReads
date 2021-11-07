<template>
            <div class="product">
          <div>
            <img
              v-bind:src="cardProduct.photo"
              class="product-pic"
              alt="Cover photo of the book."
            />
          </div>
          <div class="product-data">
            <h1 style="margin-block-start: 0rem">{{ cardProduct.title }}</h1>
            <h2>by {{ cardProduct.author }}</h2>
            <button class="add-cart clickable" @click="addToCart(cardProduct.id, cardProduct.author, cardProduct.title, cardProduct.price, cardProduct.photo)">
                {{ cardProduct.price }} {{ cardProduct.currency }} | ADD TO CART
            </button>

            <ul>
              <li><b>Length:</b> {{ cardProduct.length }} pages</li>
              <li><b>Format:</b> {{ cardProduct.format }}</li>
              <li><b>Language:</b> {{ cardProduct.language }}</li>
              <li><b>Publisher:</b> {{ cardProduct.publisher }}</li>
              <li><b>ISBN:</b> {{ cardProduct.ISBN }}</li>
            </ul>
            <div style="overflow: hidden; text-indent: -10px">
            </div>
          </div>
        </div>
</template>

<script>
export default {
    props: {
        cardProduct: {
            Type: Object,
        }
    },
    methods: {
    addToCart(id, author, title, price, photo) {
      this.$emit("receive-cart", id, author, title, price, photo);
    },
  },
}
</script>

<style>

</style>