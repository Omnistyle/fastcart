//
//  HistoryProductCell.swift
//  FastCart
//
//  Created by Jose Villanuva on 12/6/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class HistoryProductCell: UITableViewCell {

    
    
    @IBOutlet weak var nameLabel: UILabel!
    
    @IBOutlet weak var upcLabel: UILabel!
    
    @IBOutlet weak var priceLabel: UILabel!
    
    @IBOutlet weak var originalPriceLabel: UILabel!
    
    @IBOutlet weak var promoPriceLabel: UILabel!
    
    var product: Product! {
        didSet {
        
                nameLabel.text = product.name
                upcLabel.text = product.upc
                priceLabel.text = product.salePriceAsString
            if let originalPrice = product.originalPrice {
                originalPriceLabel.text = String(describing: originalPrice)
            }
                promoPriceLabel.text = product.salePriceAsString
        }
    }
    
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func layoutSubviews() {
        super.layoutSubviews()
    }
    
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
