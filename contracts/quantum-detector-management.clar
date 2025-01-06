;; Quantum Detector Management Contract

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INVALID_DETECTOR (err u101))
(define-constant ERR_INVALID_STATUS (err u102))

;; Data variables
(define-data-var detector-count uint u0)

;; Data maps
(define-map detectors
  uint
  {
    owner: principal,
    location: (string-ascii 64),
    type: (string-ascii 32),
    efficiency: uint,
    status: (string-ascii 20),
    energy-harvested: uint,
    last-maintenance: uint
  }
)

;; Public functions
(define-public (register-detector (location (string-ascii 64)) (detector-type (string-ascii 32)) (efficiency uint))
  (let
    (
      (detector-id (+ (var-get detector-count) u1))
    )
    (map-set detectors
      detector-id
      {
        owner: tx-sender,
        location: location,
        type: detector-type,
        efficiency: efficiency,
        status: "active",
        energy-harvested: u0,
        last-maintenance: block-height
      }
    )
    (var-set detector-count detector-id)
    (ok detector-id)
  )
)

(define-public (update-detector-status (detector-id uint) (new-status (string-ascii 20)))
  (let
    (
      (detector (unwrap! (map-get? detectors detector-id) ERR_INVALID_DETECTOR))
    )
    (asserts! (is-eq tx-sender (get owner detector)) ERR_NOT_AUTHORIZED)
    (asserts! (or (is-eq new-status "active") (is-eq new-status "maintenance") (is-eq new-status "inactive")) ERR_INVALID_STATUS)
    (ok (map-set detectors
      detector-id
      (merge detector { status: new-status })
    ))
  )
)

(define-public (record-energy-harvest (detector-id uint) (energy-amount uint))
  (let
    (
      (detector (unwrap! (map-get? detectors detector-id) ERR_INVALID_DETECTOR))
    )
    (asserts! (is-eq tx-sender (get owner detector)) ERR_NOT_AUTHORIZED)
    (ok (map-set detectors
      detector-id
      (merge detector {
        energy-harvested: (+ (get energy-harvested detector) energy-amount)
      })
    ))
  )
)

(define-public (perform-maintenance (detector-id uint))
  (let
    (
      (detector (unwrap! (map-get? detectors detector-id) ERR_INVALID_DETECTOR))
    )
    (asserts! (is-eq tx-sender (get owner detector)) ERR_NOT_AUTHORIZED)
    (ok (map-set detectors
      detector-id
      (merge detector {
        status: "active",
        last-maintenance: block-height
      })
    ))
  )
)

;; Read-only functions
(define-read-only (get-detector (detector-id uint))
  (map-get? detectors detector-id)
)

(define-read-only (get-detector-count)
  (var-get detector-count)
)

