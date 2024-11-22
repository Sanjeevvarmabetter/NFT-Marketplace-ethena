import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

export default function MyPurchases({ mergedContract, account }) {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])

  const loadPurchasedItems = async () => {
    const filter = mergedContract.filters.Purchased(null, null, null, account)
    const results = await mergedContract.queryFilter(filter)

    const purchases = await Promise.all(results.map(async i => {
      const eventArgs = i.args
      const tokenId = eventArgs.tokenId
      const itemId = eventArgs.itemId

      const uri = await mergedContract.tokenURI(tokenId)
      const response = await fetch(uri)
      const metadata = await response.json()

      const totalPrice = await mergedContract.getTotalPrice(itemId)

      let purchasedItem = {
        totalPrice,
        price: eventArgs.price,
        itemId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      }

      return purchasedItem
    }))

    setPurchases(purchases)
    setLoading(false)
  }

  useEffect(() => {
    loadPurchasedItems()
  }, [])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text">{item.description}</p>
                  <Card.Footer>
                    {ethers.utils.formatEther(item.totalPrice)} USD
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No purchases</h2>
        </main>
      )}
    </div>
  )
}
