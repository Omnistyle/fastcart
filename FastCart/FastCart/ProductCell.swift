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
            product.setProductImage(view: productImage)
            
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
            priceLabel.text = product.salePriceAsString
        }
    }
    
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
    }

}
