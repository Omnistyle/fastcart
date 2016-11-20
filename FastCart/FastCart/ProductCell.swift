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
            if let image = product.image {
                productImage.setImageWith(image)
            } else {
                productImage.image = #imageLiteral(resourceName: "noimagefound")
            }
            
            productImage.layer.cornerRadius = productImage.frame.size.width / 2
            productImage.layer.masksToBounds = true
            productImage.layer.borderColor = UIColor.lightGray.cgColor
            productImage.layer.borderWidth = 1
            
            if product.upc == nil {
                manual = true
                productName.text = product.name
                priceLabel.text = "NA"
                priceImage.image = #imageLiteral(resourceName: "camera_outline")
                return
            }
            productName.text = product.name
            if let salePrice = product?.salePrice {
                priceLabel.text = "$" + String(describing: salePrice)
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
