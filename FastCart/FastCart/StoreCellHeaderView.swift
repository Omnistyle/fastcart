//
//  StoreCellHeaderView.swift
//  FastCart
//
//  Created by Luis Perez on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class StoreCellHeaderView: UICollectionReusableView {

    @IBOutlet weak var storeName: UILabel!
    
    var store: Store! {
        didSet {
            storeName.text = store.name
        }
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }
    
}
