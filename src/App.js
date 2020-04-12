import React, { useEffect, useState } from 'react';
import 'rbx/index.css'
import { Message, Button, Title, Container, Column, Card, Navbar, Delete, Box} from 'rbx';
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
      <Button primary onClick={() => firebase.auth().signOut()}>
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
  const [data, setData] = useState({});
  const [openCart, setOpenCart] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [inventory, setInventory] = useState({});
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setInventory(snap.val());
    };
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(setUser);
  }, []);

  const products = Object.values(data);
  const products_sku = products.filter(product => product.sku);
  const num_products = products_sku.length;

  let copyshirt = {}
  for(let i = 0; i < num_products; i++){
    copyshirt[products[i].sku] = null;
    console.log(copyshirt)
  }

  const [sizeShirt, setSize] = useState(copyshirt);
  



  const productDict = {};
  for (let i = 0; i < num_products; i++){
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
  };

  const changeSize = (id, pick_size) =>{
    let tempSize = sizeShirt;
    tempSize[id] = pick_size;

    setSize(tempSize);

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
    console.log(sizeShirt[id])
    if (bool){
      return (
          <p> Out of Stock </p>
      );
    }
    else{
      return(
        <Button key={"cart" + id + count} disabled={sizeShirt[id] === null} onClick={() => cartAdd(id, sizeShirt[id])}> Add to Cart </Button>
      )
    }
  };

  const ShirtSizeSelector = (id) => {
    const sizes = ["S", "M", "L", "XL"];
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
        <p> {outmsg(out_of_stock, id)} </p>
      </React.Fragment>
    );
  };

  const ProductList = ( {num_products, products} ) => {
    let items = [];
    for (let i = 0; i < num_products; i++){
      items.push(
        <Card key={products[i].sku}> 
            <br></br>
            <Card.Image align="center">
              <img src={'data/products/' + products[i].sku + '_1.jpg'} width="200px" height="400px"/>
            </Card.Image>
            <Card.Header.Title align="center">{products[i].title}</Card.Header.Title> 
            <Card.Content>
              <em>{products[i].style}, {products[i].description}</em>
              <br></br>
              <Card.Footer>
                <b>
                  <br></br>
                  {products[i].currencyFormat}
                  {formatPrice(products[i].price)}
                  <br></br>
                </b>
              </Card.Footer>
              <br></br>
              {ShirtSizeSelector(products[i].sku)}
              <br></br>
              <br></br>
            </Card.Content> 
        </Card>
      )
    }

    let column = [];
    for(let i = 0; i < num_products; i = i + 4){
      if(i + 3 < num_products){
        column.push(
          <Column size="3" key={products[i].sku}>
            {items[i]}{items[i + 1]}{items[i + 2]}{items[i+3]}
          </Column>
        )
      }
      else if(i + 2 < num_products){
        column.push(
          <Column size="3" key={products[i].sku}>
            {items[i]}{items[i + 1]}{items[i + 2]}
          </Column>
        )
      }
      else if (i + 1 < num_products){
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

  const CartItems = () => {
    let list = [];
    let products = cart.map(item => item.product)
    for (let i = 0; i < products.length; i++){
      list.push(
        <Card key={products[i].sku+sizeShirt[products[i].sku]} style={{display:'inline-block', width:'100%'}}>
          <div>
            <div style={{float:'left'}}>
              <Card.Image align="left">
                <img src={'data/products/' + products[i].sku + '_1.jpg'} width="100px" height="100px"/>
              </Card.Image>
            </div>
            <div style={{float:'center'}}>
              <Card.Content style={{align:'right'}}>
                <b>{products[i].title}</b>
                <br></br>
                <em>{products[i].style}</em>
                <br></br>
                <em>{products[i].description}</em>
                <br></br>
                <div>
                  <div>
                    <Button key={"plus" + products[i].sku + cart[i].itemId} disabled={inventory[products[i].sku][cart[i].buy_size] == 0} onClick={ () => cartAdd(products[i].sku, cart[i].buy_size) }> + </Button>
                    <Button key={"minus" + products[i].sku + cart[i].itemId} onClick={ () => cartRemove(products[i].sku, cart[i].buy_size) }> - </Button>
                  </div>
                </div>
                <div style={{float:'right'}}>
                    <b>
                      <br></br>
                      <p>SIZE: {cart[i].buy_size} </p>
                      <p>QTY: {cart[i].qty} </p>
                      <br></br>
                      {products[i].currencyFormat}
                      {formatPrice(products[i].price)}
                    </b>
                </div>
              </Card.Content>
            </div>
          </div>
        </Card>
      )
    }
    return (
      <Column> {list} </Column>
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
        <Column.Group multiline="true">
          {ProductList({num_products, products})}
        </Column.Group>
      </Container>
    </React.Fragment>
  );
};

export default App;