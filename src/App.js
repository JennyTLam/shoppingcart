import React, { useEffect, useState } from 'react';
import 'rbx/index.css'
import { Button, Container, Column, Card } from 'rbx';

const sizes = { S: 'S', M: 'M', L: 'L', XL: 'XL'};

const SizeSelector = () => (
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

const App = () => {
  const [data, setData] = useState({});
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

  const formatPrice = ( price ) => {
    const result = price.toString().split(".");
    if (result.length === 1){
      return result[0] + "." + "00";
    }
    else if (result.length ===2){
      const cents = (result[1].length == 1) ? result[1] + "0" : result[1];
      return result[0] + "." + cents
    }
    return result.length
  }

  const createGrid = () => {
    let grid = [];

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
              <Button key={products[i].sku}> Add to Cart </Button> 
              <br></br>
              <br></br>
            </Card.Content> 
        </Card>
      )
    }

    let column = [];
    let start = 0;
    let end = 3;
    for(let i = start; i < num_products; i = i + 4){
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
  }

  return (
    <React.Fragment>
      <br></br>
      <Container fluid="true" align="center"> <SizeSelector /> </Container>
      <br></br>
      <Container>
        <Column.Group multiline="true">
          {createGrid()}
        </Column.Group>
      </Container>
    </React.Fragment>
  );
};

export default App;