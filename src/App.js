import React, { useEffect, useState } from 'react';
import 'rbx/index.css'
import { Button, Title, Container, Column, Card, Navbar, Delete, Box} from 'rbx';
import Drawer from '@material-ui/core/Drawer';

const SignIn = () => {
  return (
    <Navbar>
      <Navbar.Brand>
        <Navbar.Item href="#">
          <img
            src="/data/logo.png"
            alt=""
            role="presentation"
            width="150"
            height="400"
          />
        </Navbar.Item>
        <Navbar.Burger />
      </Navbar.Brand>
      <Navbar.Menu>
        <Navbar.Segment align="end">
          <Navbar.Item>
            <Button.Group>
              <Button color="primary">
                <strong>Sign In</strong>
              </Button>
            </Button.Group>
          </Navbar.Item>
        </Navbar.Segment>
      </Navbar.Menu>
    </Navbar> 
  );
};

const sizes = { S: 'S', M: 'M', L: 'L', XL: 'XL'};

const ShirtSizeSelector = () => (
  <Button.Group hasAddons>
    { Object.values(sizes)
      .map(size =>
        <Button key={ size }
          >
          { size }
        </Button>
      )
    }
  </Button.Group>
);

const formatPrice = ( price ) => {
  const result = price.toString().split(".");
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
  
  const products = Object.values(data);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('./data/products.json');
      const json = await response.json();
      setData(json);
    };
    fetchProducts();
  }, []);

  const products_sku = products.filter(product => product.sku);
  const num_products = products_sku.length;

  const productDict = {};
  for (let i = 0; i < num_products; i++){
    productDict[products[i].sku] = products[i];
  }

  const cartAdd = (id) => {
    setOpenCart(true);
    let tempCart = cart;
    let inCart = false;
    for (let i = 0; i < tempCart.length; i++){
      if (tempCart[i].itemId === id){
        tempCart[i].qty += 1;
        inCart = true;
        break;
      }
    }
    if (!inCart){
      tempCart.push(
        {itemId: id, 
         qty: 1, 
         product: productDict[id],
       })
    }
    setCart(tempCart);
  };

  const ShoppingCart = () => {
    return (
      <Container>
        <Button
          onClick={() => setOpenCart(true)}> Cart 
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
            <Button> Checkout </Button>
          </Box>
        </Drawer>
      </Container>
    );
  };

  const WelcomeBanner = () => {
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
                  <ShirtSizeSelector />
                  {products[i].currencyFormat}
                  {formatPrice(products[i].price)}
                  <br></br>
                </b>
              </Card.Footer>
              <br></br>
              <Button key={products[i].sku} onClick ={() => cartAdd(products[i].sku)}> Add to Cart </Button> 
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
        <Card key={products[i].sku} style={{display:'inline-block', width:'100%'}}>
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
                    <Button onClick={ () => cartAdd(products[i].sku) }> + </Button>
                    <Button> - </Button>
                  </div>
                </div>
                <div style={{float:'right'}}>
                    <b>
                      <br></br>
                      <p>QTY: 1</p>
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
      <WelcomeBanner  />
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