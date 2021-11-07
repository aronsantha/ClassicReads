<template>
  <div id="app">
    <!-- nav bar with cart icon -->
    <div id="navbar">
      <div @click="step = 0" id="title">
        <span class="clickable">ClassicReads</span>
      </div>

      <div
        id="cart"
        class="clickable no-print"
        v-if="cartIcon"
        @click="step = 1"
      >
        {{ cartCounter }}
        <img :src="cartIcon" id="cart-pic" />
      </div>
      <div v-else id="cart-fallback" class="clickable no-print">
        Cart ({{ cartCounter }})
      </div>
    </div>

    <!-- product page -->

    <div class="centralise page-container" v-if="step == 0">
      <div v-for="product in products" :key="product.id">
        <ProductCard :cardProduct="product" @receive-cart="addToCart" />
      </div>
    </div>

    <!-- cart page -->

    <div class="page-container" v-if="step == 1">
      <div class="cart-n-payment-grid">
        <span class="cart-wrap">
            <h1 class="cart-title">Your Cart</h1>
            <h1 class="ordered-products"></h1>
            <br>
          <div class="cart-grid top">
            <div>Item(s)</div>
            <div class="align-right">Qty</div>
            <div class="align-right">Price</div>
          </div>
          <div v-for="item in cart" class="cart-grid content" :key="item.id">
            <div>
              <img
                v-bind:src="item.photo"
                style="max-width: 50px; max-height: 100px"
                alt="Cover photo of the book."
              />
            </div>

            <div style="padding-left: 20px">
              <b>{{ item.title }}</b>
              <br />
              by {{ item.author }}
            </div>

            <div class="align-right">{{ item.quantity }}</div>
            <div class="align-right">{{ item.price * item.quantity }} kr</div>
          </div>

          <div class="empty" v-show="cartCounter == 0">Your cart is empty.</div>

          <div class="cart-grid bottom" v-show="cartCounter != 0">
            <div></div>
            <h2 class="align-right">Total: {{ totalPrice }} kr</h2>
          </div>
          <div
            class="pay-button clickable no-print"
            :style="{ 'pointer-events': isClicked ? 'none' : null }"
            v-show="cartCounter != 0 && !isClicked"
            @click="payTrigger(totalPrice)"
          >
            Pay now
          </div>
          <div
            class="pay-button clickable no-print"
            v-show="isClicked"
            @click="printCart()"
          >
            Print your cart
          </div>
          <div
            class="pay-button clickable"
            v-show="cartCounter == 0"
            @click="step = 0"
          >
            Go to Products
          </div>
          <div class="dummy-card no-print">
            <span class="card-mono title">Test card number</span>
            <span class="card-mono nr">1000 0100 0000 0007</span>
            <p style="margin: 0; line-height: 1.3em">Use this card number together with any future expiration date and any random CVD number. </p>
            <br>
            <p style="font-style: italic; margin: 0;"> More test data <a href="https://learn.quickpay.net/tech-talk/appendixes/test/#test-data" target="_blank" style="color: #083d4d; font-weight: 900;">here</a>.</p>
          </div>
        </span>        
        <span>
        </span>
        <span id="iframe-style" class="no-print" v-show="isClicked">
            <iframe
            @load="showIframe = !showIframe"
            :src="paymentUrl"
            title="Payment"
            width="340px"
            height="680px"
            frameBorder="0"
            class="no-print"
            style="background: transparent"
          >
          </iframe>
        </span>
      </div>
      <p class="pleasant-reading"></p>
    </div>

    <!-- footer -->
    <div class="footer no-print">
      <p>© 2021 Aron Santha</p>
    </div>
  </div>
</template>

<script>
import allBooks from "./books.json";
import ProductCard from "./components/ProductCard.vue";
export default {
  name: "App",
  components: {
    ProductCard,
  },
  data() {
    return {
      products: allBooks,
      cart: [],
      cartCounter: 0,
      cartIcon: require("./assets/cartpic.svg"),
      step: 0,
      paymentUrl: null,
      showIframe: false,
      isClicked: false,
    };
  },
  computed: {
    totalPrice() {
      var grandTotal = 0;
      this.cart.forEach((element) => {
        var total = element.price * element.quantity;
        grandTotal = grandTotal + total;
      });
      return grandTotal;
    },
  },
  methods: {
    addToCart(id, author, title, price, photo) {
      this.cartCounter++;
      var alreadyExists = false;
      this.cart.forEach((element) => {
        if (element.id == id) {
          element.quantity++;
          alreadyExists = true;
        }
      });

      if (alreadyExists == false) {
        var bookToCart = {
          id: id,
          author: author,
          title: title,
          price: price,
          quantity: 1,
          photo: photo,
        };
        this.cart.push(bookToCart);
      }
      return this.cart;
    },
    createId() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const length = 7;
      let randomStr = "";

      for (let i = 0; i < length; i++) {
        const randomNum = Math.floor(Math.random() * characters.length);
        randomStr += characters[randomNum];
      }

      return Date.now() + randomStr;
    },
    payTrigger(totalPrice) {
      this.isClicked = true;
      var order_id = this.createId();
      var data = {
        currency: "dkk",
        amount: totalPrice,
        order_id: order_id,
      };
      this.axios({
        method: "post",
        url: "https://classicreads.netlify.app/.netlify/functions/payment",
        data: data,
      })
        .then((response) => {
          this.paymentUrl = response.data;
        })
        .then(this.eventListener);
    },
    eventListener() {
      window.addEventListener("message", this.messageCheck);
    },
    messageCheck(event) {
      console.log(event.data);
      window.removeEventListener("message", this.messageCheck);
    },
    printCart() {
      window.print();
    },
  },
};
</script>

<style>
h1,
h2,
#title,
#cart,
.add-cart,
#cart-length-s,
#cart-length-m,
#cart-fallback,
.pay-button {
  font-family: "Alice", Georgia, serif;
}
body {
  font-family: "Roboto", Helvetica, sans-serif;
  margin: 0;
  margin-top: 120px;
  background: #e8e9e8;
}

h1 {
  margin: 5px;
  font-size: 180%;
  letter-spacing: 0.02em;
}

h2 {
  margin: 5px;
  font-size: 150%;
}

h3 {
  font-size: 150%;
}

.product-data ul {
  list-style-type: none;
  padding-left: 0;
  font-size: 110%;
  letter-spacing: 0.02em;
}

.product-data li {
  margin-top: 7px;
}

.product {
  width: 525px;
  max-width: 70vw;
  height: 330px;
  padding: 30px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  background-color: #bdc0c5;
  background: linear-gradient(1.6turn, #c8caca, #e8e9e8);
  border-radius: 35px;
  border-width: 2px;
  margin: 20px;
  color: #061f23;
  box-shadow: 1px 2px 7px 0px #3f504c81;
}

.product-pic {
  width: 200px;
  height: 330px;
  object-fit: cover;
  border-radius: 15px;
  float: left;
  margin-right: 30px;
}

.product-data {
  width: 285px;
  vertical-align: top;
}

.add-cart {
  width: 260px;
  height: 55px;
  padding: 10px;
  text-align: center;
  font-size: 22px;
  background-color: #003333;
  border-radius: 15px 15px 15px 15px;
  border: none;
  color: #ebece7;
  margin-top: 20px;
  margin-bottom: 10px;
}



#navbar {
  width: 100%;
  text-align: center;
  background: #003333;
  color: #e8e9e8;
  height: 70px;
  position: fixed;
  top: 0px;
  box-shadow: 0px 1px 5px 0px #002929c0;
}

.footer {
  width: 100%;
  text-align: center;
  font-size: 110%;
  letter-spacing: 0.03em;
  background: #003333;
  color: #ebece7;
  height: 40px;
  line-height: 40px;
  margin-top: 50px;
}

#cart {
  position: absolute;
  padding-top: 13px;
  top: 15px;
  right: 35px;
  box-sizing: border-box;
  width: 35px;
  height: 35px;
  color: #003333;
  font-weight: bold;
  font-size: 120%;
}

#cart-pic {
  position: absolute;
  left: 0px;
  top: 2px;
  width: 100%;
  height: 100%;
  z-index: -1;
}

#cart-fallback {
  width: 100px;
  height: 35px;
  position: absolute;
  top: 17px;
  right: 35px;
  background-color: #e8e9e8;
  border-radius: 10px 30px 10px 30px;
  text-align: center;
  color: #003333;
  font-weight: bold;
  font-size: 120%;
  line-height: 35px;
}

#title {
  line-height: 70px;
  font-size: 37px;
}



.centralise {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.page-container {
  max-width: 1920px;
  margin: auto;
}

.cart-grid {
  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  background-color: #0033331a;
  padding: 15px;
}

.dummy-card {
  display: grid;
  background-color: #7ba4b6;
  background-image: url("./assets/chip.svg"), url("./assets/mc.svg");
  background-repeat: no-repeat;
  background-position: 7% 29%, 90% 92%;
  background-size: 17%, 15%;
  color: #ffffffec;
  text-shadow: 1px 1px 3px #083d4d9f;
  border-radius: 1.3em;
  box-sizing: border-box;
  padding: 1.6em;
  margin-top: 1em;
  max-width: 340px; 
}

.cart-n-payment-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.cart-wrap {
min-width:340px; width:800px; margin: 10px
}

.top {
  grid-template-columns: 60% repeat(2, 20%);
  background-color: #003333;
  color: #e8e9e8;
  font-weight: bold;
  letter-spacing: 0.05em;
  margin-bottom: 5px;
  font-size: 1.1em;
}

.content {
  grid-template-columns: 15% 45% repeat(2, 20%);
  color: #003333;
  font-size: 1.1em;
}

.bottom {
  padding: 10px;
  background-color: #0033334f;
  color: #003333;
  margin-top: 5px;
}

.pay-button {
  padding: 10px;
  margin-top: 5px;
  height: 40px;
  font-size: 150%;
  line-height: 40px;
  text-align: center;
  background-color: #003333;
  border: none;
  color: #ebece7;
}

.align-right {
  text-align: right;
}

.empty {
  padding: 10px;
  margin-top: 5px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: #0033331a;
  color: #003333;
  border: none;
}

#iframe-style{
  background-image: url("./assets/load.gif"), url("./assets/loading.svg") ;
  background-color: #0033331a;
  background-position: 50% 46%, 50% 54%;
  background-repeat: no-repeat;
  margin: 10px;
}

#loading {
  position: relative;
  top: 55%;
  left:18%;
  color: #003333;
  font-weight: 900;
  z-index: -1;
}

.card-mono {
  font-size: 1.6em; font-family: monospace; 
}

.title {
  text-transform: uppercase; margin: 0;
}

.nr {
  margin-top: 0.8em; margin-bottom: 0.8em; text-align:right;   
}

.cart-title {
  color: #061f23;
}

/* MEDIA QUERIES */

@media (hover: hover) {
  .add-cart:hover {
    background-color: #015757;
    box-shadow: 0px 0px 4px 0px #0157576b;
  }

  .add-cart:active {
    background-color: #003333;
    color: #ebece7;
    box-shadow: 0px 0px 4px 0px #0157576b;
  }

  .clickable:hover {
  cursor: pointer;
}

.pay-button:hover {
  background-color: #015757;
  box-shadow: 0px 0px 4px 0px #0157576b;
}

.pay-button:active {
  background-color: #003333;
  color: #ebece7;
  box-shadow: 0px 0px 4px 0px #0157576b;
}
}

@media print {
  .no-print {
    display: none;
  }

  .cart-title {
  display: none;
}

  .cart-n-payment-grid {
    grid-template-columns: none;
    margin: 30px;
  }

  .ordered-products:before {
    content: "Your Order";
  }

  .pleasant-reading:before {
    content: "Thank you for buying from us. We wish you a pleasant reading! - ClassicReads";
    color: #033;
    font-size: 1.1em;
    margin-left: 30px;
    position: absolute;
    bottom: 20px;
  }
}

@media only screen and (max-width: 640px) {
  /* body {
font-size: 90%;
} */

#title {
font-size: 30px
}

#cart {
  position: absolute;
  padding-top: 10px;
  top: 18px;
  right: 20px;
  width: 30px;
  height: 30px;
}

.product {
  height: auto;
}

.product-pic {
    display: none;
}

.add-cart {
  font-size: 20px;
}
}
</style>

