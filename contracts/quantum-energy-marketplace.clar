;; Quantum Energy Marketplace Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_LISTING (err u101))
(define-constant ERR_INSUFFICIENT_BALANCE (err u102))

;; Define the quantum energy token
(define-fungible-token quantum-energy)

;; Data variables
(define-data-var listing-count uint u0)

;; Data maps
(define-map energy-listings
  uint
  {
    seller: principal,
    amount: uint,
    price-per-unit: uint,
    expiration: uint
  }
)

;; Public functions
(define-public (create-energy-listing (amount uint) (price-per-unit uint) (expiration uint))
  (let
    (
      (listing-id (+ (var-get listing-count) u1))
    )
    (try! (ft-transfer? quantum-energy amount tx-sender (as-contract tx-sender)))
    (map-set energy-listings
      listing-id
      {
        seller: tx-sender,
        amount: amount,
        price-per-unit: price-per-unit,
        expiration: (+ block-height expiration)
      }
    )
    (var-set listing-count listing-id)
    (ok listing-id)
  )
)

(define-public (purchase-energy (listing-id uint) (amount uint))
  (let
    (
      (listing (unwrap! (map-get? energy-listings listing-id) ERR_INVALID_LISTING))
      (total-cost (* (get price-per-unit listing) amount))
    )
    (asserts! (<= amount (get amount listing)) ERR_INVALID_LISTING)
    (asserts! (>= (stx-get-balance tx-sender) total-cost) ERR_INSUFFICIENT_BALANCE)
    (try! (stx-transfer? total-cost tx-sender (get seller listing)))
    (try! (as-contract (ft-transfer? quantum-energy amount tx-sender tx-sender)))
    (if (is-eq amount (get amount listing))
      (map-delete energy-listings listing-id)
      (map-set energy-listings
        listing-id
        (merge listing { amount: (- (get amount listing) amount) })
      )
    )
    (ok true)
  )
)

(define-public (cancel-energy-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? energy-listings listing-id) ERR_INVALID_LISTING))
    )
    (asserts! (is-eq tx-sender (get seller listing)) ERR_NOT_AUTHORIZED)
    (try! (as-contract (ft-transfer? quantum-energy (get amount listing) tx-sender (get seller listing))))
    (map-delete energy-listings listing-id)
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-energy-listing (listing-id uint))
  (map-get? energy-listings listing-id)
)

(define-read-only (get-listing-count)
  (var-get listing-count)
)

