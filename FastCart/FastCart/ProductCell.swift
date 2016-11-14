//
//  ProductCell.swift
//  FastCart
//
//  Created by Luis Perez on 11/13/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ProductCell: UITableViewCell {

    @IBOutlet weak var productImage: UIImageView!
    @IBOutlet weak var productName: UILabel!
    @IBOutlet weak var priceImage: UIImageView!
    @IBOutlet weak var priceLabel: UILabel!
    
    var product: Product! {
        didSet {
            productName.text = product.brandName
            priceLabel.text = "$\(product.salePrice)"
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
