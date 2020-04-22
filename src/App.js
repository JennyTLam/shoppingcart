import React, { useEffect, useState } from 'react';
import 'rbx/index.css'
import { Message, Button, Title, Container, Column, Card, Delete, Box} from 'rbx';
import Drawer from '@material-ui/core/Drawer';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyAqXlhT3mjRfFXIcbhj2orBUziHAqNRFY8",
  authDomain: "shoppingcart-reactapp.firebaseapp.com",
  databaseURL: "https://shoppingcart-reactapp.firebaseio.com",
  projectId: "shoppingcart-reactapp",
  storageBucket: "shoppingcart-reactapp.appspot.com",
  messagingSenderId: "634387548610",
  appId: "1:634387548610:web:d953ac9b8ec0bc96f92e5b",
  measurementId: "G-BB8C10M49R"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

const Welcome = ({ user }) => (
  <Message color="info">
    <Message.Header>
      Welcome, {user.displayName}
      <Button primary="true" onClick={() => firebase.auth().signOut()}>
        Log out
      </Button>
    </Message.Header>
  </Message>
);

const SignIn = () => (
  <StyledFirebaseAuth
    uiConfig={uiConfig}
    firebaseAuth={firebase.auth()}
  />
);

const Banner = ({ user }) => (
  <React.Fragment>
    { user ? <Welcome user={ user } /> : <SignIn /> }
  </React.Fragment>
);


const formatPrice = ( price ) => {
  const result = Math.abs(price).toFixed(2).toString().split(".");
  if (result.length === 1){
    return result[0] + "." + "00";
  }
  else if (result.length === 2){
    const cents = (result[1].length === 1) ? result[1] + "0" : result[1];
    return result[0] + "." + cents;
  }
  else{
    console.error("Invalid Price Format");
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [openCart, setOpenCart] = useState(false);
  const [data, setData] = useState({});
  const [inventory, setInventory] = useState({});
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
    const handleData = snap => {
      if (snap.val()) 
        setInventory(snap.val().inventory);
    };
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  const mergeCarts = ({user, pulledCart}) => {
    const newCart = pulledCart;
    const fixed = pulledCart;
    const currentCart = cart;
    for(let i = 0; i < currentCart.length; i++){
      let newItem = true;
      for(let j = 0; j < fixed.length; j++){
        if (currentCart[i].itemId === newCart[j].itemId){
          newItem = false;
          newCart[j].qty += 1;
          break;
        }
      }
      if (newItem){
        newCart.push(currentCart[i])
      }
    }
    setCart(newCart)
    console.log(newCart)
    db.child('carts').child(user.uid).set(newCart)
  }

  const userUpdateFunc = (user) => {
    if(user){
      const db2 = firebase.database().ref('carts/' + user.uid);
      const handleData2 = snap => {
        if(snap.val()){
          const pulledCart = snap.val()
          mergeCarts({user, pulledCart});
          console.log('how')
        }
        else{
          console.log('where')
          console.log(cart)
          db.child('carts').child(user.uid).set(cart)
        }
        db2.off('value', handleData2);
      }
      db2.on('value', handleData2, error => alert(error));
    }
    setUser(user);
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged(userUpdateFunc);
  }, []);

  const products = Object.values(data);
  const productDict = {};
  for (let i = 0; i < products.length; i++){
    productDict[products[i].sku] = products[i];
  }

  const available_inventory = Object.keys(inventory);
  const inv = Object.values(inventory)
  const small = {}
  const medium = {}
  const large = {}
  const xl = {}
  for (let i = 0; i < available_inventory.length; i++){
    small[available_inventory[i]] = inv[i].S
    medium[available_inventory[i]] = inv[i].M
    large[available_inventory[i]] = inv[i].L
    xl[available_inventory[i]] = inv[i].XL
  }

  let copyshirt = {}
  for(let i = 0; i < products.length; i++){
    copyshirt[products[i].sku] = null;
  }
  const [sizeShirt, setSize] = useState(copyshirt);

  const WelcomeBanner = ({user}) => {
    return (
      <div>
        <div style={{padding:'10px', display:'inline-block'}}>
          <Title>Welcome to Classic Tees Online Store</Title>
        </div>
        <div style={{padding:'5px', float:'right', display:'inline-block'}}>
          <ShoppingCart />
        </div>
      </div>
    );
  };

  const outmsg = (bool, id) =>{
    let value = bool ? <p> Out of Stock </p> : 
          <Button key={"cart" + id + count} disabled={sizeShirt[id] === null} onClick={() => cartAdd(id, sizeShirt[id])}> Add to Cart </Button> 
    return value
  };

  const changeSize = (id, pick_size) =>{
    let tempSize = sizeShirt;
    tempSize[id] = pick_size;
    setSize(tempSize);
  };

  const ShirtSizeSelector = (id) => {
    let size_buttons = []
    let out_of_stock = true

    if (small[id] > 0){
      size_buttons.push(
        <Button key={id + "S"} disabled={false} onClick={() => changeSize(id, "S")}> S </Button>
        )
      out_of_stock = false
    }
    else{
      size_buttons.push(
        <Button key={id + "S"} disabled={true}> S </Button>
      )
    }

    if (medium[id] > 0){
      size_buttons.push(
        <Button key={id + "M"} disabled={false} onClick={() => changeSize(id, "M")}> M </Button>
        )
      out_of_stock = false
    }
    else{
      size_buttons.push(
        <Button key={id + "M"} disabled={true}> M </Button>
      )
    }

    if (large[id] > 0){
      size_buttons.push(
        <Button key={id + "L"} disabled={false} onClick={() => changeSize(id, "L")}> L </Button>
        )
      out_of_stock = false
    }
    else{
      size_buttons.push(
        <Button key={id + "L"} disabled={true}> L </Button>
      )
    }

    if (xl[id] > 0){
      size_buttons.push(
        <Button key={id + "XL"} disabled={false} onClick={() => changeSize(id, "XL")}> XL </Button>
        )
      out_of_stock = false
    }
    else{
      size_buttons.push(
        <Button key={id + "XL"} disabled={true}> XL </Button>
      )
    }

    return (
      <React.Fragment>
        <Button.Group hasAddons>
          {size_buttons}
        </Button.Group>
        {outmsg(out_of_stock, id)}
      </React.Fragment>
    );
  };

  const ProductCard = ( { product } ) => {
    return (
      <Card key={product.sku}> 
            <br></br>
            <Card.Image align="center">
              <img alt="product + id" src={'data/products/' + product.sku + '_1.jpg'} width="200px" height="400px"/>
            </Card.Image>
            <Card.Header.Title align="center">{product.title}</Card.Header.Title> 
            <Card.Content>
              <em>{product.style}, {product.description}</em>
              <br></br>
              <Card.Footer>
                <b>
                  <br></br>
                  {product.currencyFormat}
                  {formatPrice(product.price)}
                  <br></br>
                </b>
              </Card.Footer>
              <br></br>
              {ShirtSizeSelector(product.sku)}
              <br></br>
              <br></br>
            </Card.Content> 
      </Card>
    );
  };

  const ProductList = ( { products } ) => {
    let items = [];
    for (let i = 0; i < products.length; i++){
      items.push(
       <ProductCard product={products[i]} />
      )
    }

    let column = [];
    for(let i = 0; i < products.length; i = i + 4){
      if(i + 3 < products.length){
        column.push(
          <Column size="3" key={products[i].sku}>
            {items[i]}{items[i + 1]}{items[i + 2]}{items[i+3]}
          </Column>
        )
      }
      else if(i + 2 < products.length){
        column.push(
          <Column size="3" key={products[i].sku}>
            {items[i]}{items[i + 1]}{items[i + 2]}
          </Column>
        )
      }
      else if (i + 1 < products.length){
        column.push(
          <Column size="3" key={products[i].sku}>
            {items[i]}{items[i + 1]}
          </Column>
        )
      }
      else{
        column.push(
          <Column size="3" key={products[i].sku}>
                {items[i]}
          </Column>
        )
      }

    }
    return column
  };

  const cartAdd = (id, size) => {
    setCount(count + 1);
    setOpenCart(true);
    let tempCart = cart;
    let tempInv = inventory;
    let inCart = false;
    for (let i = 0; i < tempCart.length; i++){
      if (tempCart[i].itemId === (id + size)){
        if (tempInv[id][size] > 0){
          tempCart[i].qty += 1;
          tempInv[id][size] -= 1;
          setCartTotal(cartTotal + productDict[id].price);
        }
        inCart = true;
        break;
      }
    }
    if (!inCart && tempInv[id][size] > 0){
      tempCart.push(
        {itemId: id + size, 
         qty: 1, 
         product: productDict[id],
         buy_size: size
       })
      tempInv[id][size] -= 1;
      setCartTotal(cartTotal + productDict[id].price);
    }
    setCart(tempCart);
    setInventory(tempInv);
    if(user){
      const db2 = firebase.database().ref('carts/' + user.uid);
      const handleData2 = snap => {
        db.child('carts').child(user.uid).set(tempCart)
        db2.off('value', handleData2);
      }
      db2.on('value', handleData2, error => alert(error));
    }
  };

  const cartRemove = (id, size) => {
    setCount(count + 1);
    setOpenCart(true);
    let tempCart = cart;
    let tempInv = inventory; 
    for (let i = 0; i < tempCart.length; i++){
      if (tempCart[i].itemId === (id + size)){
        tempCart[i].qty -= 1;
        tempInv[id][size] += 1;
        break;
      }
    }

    tempCart = tempCart.filter(item => item.qty > 0)
    setCart(tempCart);
    setCartTotal(cartTotal - productDict[id].price);
    setInventory(tempInv);
    if(user){
      const db2 = firebase.database().ref('carts/' + user.uid);
      const handleData2 = snap => {
        db.child('carts').child(user.uid).set(tempCart)
        db2.off('value', handleData2);
      }
      db2.on('value', handleData2, error => alert(error));
    }
  };

  const CartItem = ({product, cartItem}) => {
    return (
      <Card key={product.sku+sizeShirt[product.sku]} style={{display:'inline-block', width:'100%'}}>
        <div>
          <div style={{float:'left'}}>
            <Card.Image align="left">
              <img alt="product + id" src={'data/products/' + product.sku + '_1.jpg'} width="100px" height="100px"/>
            </Card.Image>
          </div>
          <div style={{float:'center'}}>
            <Card.Content style={{align:'right'}}>
              <b>{product.title}</b>
              <br></br>
              <em>{product.style}</em>
              <br></br>
              <em>{product.description}</em>
              <br></br>
              <div>
                <div>
                  <Button key={"plus" + product.sku + cartItem.itemId} disabled={inventory[product.sku][cartItem.buy_size] === 0} onClick={ () => cartAdd(product.sku, cartItem.buy_size) }> + </Button>
                  <Button key={"minus" + product.sku + cartItem.itemId} onClick={ () => cartRemove(product.sku, cartItem.buy_size) }> - </Button>
                </div>
              </div>
              <div style={{float:'right'}}>
                  <b>
                    <br></br>
                    <p>SIZE: {cartItem.buy_size} </p>
                    <p>QTY: {cartItem.qty} </p>
                    <br></br>
                    {product.currencyFormat}
                    {formatPrice(product.price)}
                  </b>
              </div>
            </Card.Content>
          </div>
        </div>
      </Card>
    );
  };

  const CartItems = () => {
    let list = [];
    let products = cart.map(item => item.product)
    for (let i = 0; i < products.length; i++){
      list.push(
        <CartItem product={products[i]} cartItem={cart[i]} />
      )
    }
    return (
      <Column> {list} </Column>
    );
  };

  const ShoppingCart = () => {
    return (
      <Container>
        <Button
          style={{marginRight:'40px'}}
          onClick={() => setOpenCart(true)}> <b>Cart </b>
        </Button>
        <Drawer
          width="100%"
          anchor="right"
          open={openCart}
        > 
          <Delete onClick={() => setOpenCart(false)}></Delete>
          <Box style={{pading:'20px'}}>
            <Title> My Cart </Title>
          </Box>
          <Box style={{width:'400px'}}>
            <Column.Group>
              {CartItems()}
            </Column.Group>
          </Box>
          <Box style={{float:'left'}}>
            <p> Total: ${formatPrice(cartTotal)} </p>
            <Button> Checkout </Button>
          </Box>
        </Drawer>
      </Container>
    );
  };


  return (
    <React.Fragment>
      <br></br>
      <br></br>
      <Banner user={user} />
      <br></br>
      <WelcomeBanner user={user} />
      <br></br>
      <Container>
        <Column.Group multiline>
          {ProductList({products})}
        </Column.Group>
      </Container>
    </React.Fragment>
  );
};

export default App;