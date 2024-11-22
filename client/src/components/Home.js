// Import required libraries and components
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Button, Alert, Spinner } from 'react-bootstrap';

const Home = ({ mergedContract }) => {
  const [loading, setLoading] = useState(true); // Manage loading state
  const [items, setItems] = useState([]); // Marketplace items
  const [error, setError] = useState(null); // Error messages
  const DECIMALS = 18; // Standard for Ethereum-based tokens

  // Function to load items from the marketplace
  const loadMarketplaceItems = async () => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors

    try {
      const itemCount = await mergedContract.itemCount(); // Get total items
      const loadedItems = await Promise.all(
        Array.from({ length: itemCount }, (_, i) => i + 1).map(async (i) => {
          const item = await mergedContract.items(i);
          if (!item.sold) {
            const uri = await mergedContract.tokenURI(item.tokenId);
            const response = await fetch(uri);
            if (!response.ok) {
              throw new Error(`Failed to fetch metadata for token ${item.tokenId}`);
            }
            const metadata = await response.json();
            const formattedPrice = ethers.utils.formatUnits(item.price, DECIMALS);
            return {
              itemId: item.itemId.toString(),
              seller: item.seller,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
              price: formattedPrice,
            };
          }
          return null; // Skip sold items
        })
      );

      // Update state with filtered items
      setItems(loadedItems.filter((item) => item !== null));
    } catch (err) {
      console.error("Error loading marketplace items:", err);
      setError("Failed to load marketplace items. Please try again later.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to handle purchasing an NFT
  const buyMarketItem = async (item) => {
    setError(null); // Clear previous errors
    try {
      const totalPrice = await mergedContract.getTotalPrice(item.itemId); // Calculate total price
      const transaction = await mergedContract.purchaseItem(item.itemId, {
        value: totalPrice,
        gasLimit: 500000, // Provide sufficient gas
      });
      await transaction.wait(); // Wait for transaction confirmation
      await loadMarketplaceItems(); // Reload marketplace items after purchase
    } catch (err) {
      console.error("Error purchasing item:", err);
      setError("seller cant purchase the nft.");
    }
  };

  // Load marketplace items on component mount
  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  // Render loading spinner if data is still being fetched
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading marketplace items...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            {/* Display any error messages */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Show items if available, else display 'No listed items' */}
            {items.length > 0 ? (
              <Row xs={1} md={2} lg={4} className="g-4">
                {items.map((item) => (
                  <Col key={item.itemId} className="overflow-hidden">
                    <div className="card" style={{ width: '18rem', border: '1px solid #ddd' }}>
                      <img
                        className="card-img-top"
                        src={item.image}
                        alt={item.name}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{item.name}</h5>
                        <p className="card-text">{item.description}</p>
                        <p><strong>Price:</strong> {item.price} USDe</p>
                        <Button
                          onClick={() => buyMarketItem(item)}
                          variant="primary"
                          aria-label={`Buy ${item.name} NFT`}
                        >
                          Buy NFT
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <h2 style={{ textAlign: 'center', margin: '20px 0' }}>No listed items</h2>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
