//
//  OfferView.swift
//  FastCart
//
//  Created by Luis Perez on 12/10/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class OfferView: UIView {
    @IBOutlet weak var storeImage: UIImageView!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var storeLabel: UILabel!
    @IBOutlet var contentView: UIView!
    
    var offer: Offer! {
        didSet {
            priceLabel.text = offer.priceAsString
            storeImage.image = offer.availability == .available ? #imageLiteral(resourceName: "check") : #imageLiteral(resourceName: "forbidden")
            storeLabel.text = offer.merchant
        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initSubviews()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initSubviews()
    }
    
    func initSubviews() {
        let nib = UINib(nibName: "OfferView", bundle: nil)
        nib.instantiate(withOwner: self, options: nil)
        contentView.frame = bounds
        addSubview(contentView)
    }
}
