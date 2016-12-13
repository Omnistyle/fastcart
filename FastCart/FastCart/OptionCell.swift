//
//  OptionCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/22/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class OptionCell: UITableViewCell {

//    @IBOutlet weak var iconImageView: UIImageView!
    @IBOutlet weak var optionLabel: UILabel!
    
    @IBOutlet weak var chevronImage: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
