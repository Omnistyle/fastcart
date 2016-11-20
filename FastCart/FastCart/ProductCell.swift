//
//  ProductCell.swift
//  FastCart
//
//  Created by Luis Perez on 11/13/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AVFoundation


class ProductCell: UITableViewCell {

    @IBOutlet weak var productImage: UIImageView!
    @IBOutlet weak var productName: UILabel!
    @IBOutlet weak var priceImage: UIImageView!
    @IBOutlet weak var priceLabel: UILabel!
    
    var manual = false
    
    var product: Product! {
        didSet {
            productName.text = product.name
            if let salePrice = product?.salePrice {
                priceLabel.text = "$" + String(describing: salePrice)
            }
            if let image = product.image {
                productImage.setImageWith(image)
            }
            
            if product.upc == nil {
                manual = true
            }
            
        }
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
