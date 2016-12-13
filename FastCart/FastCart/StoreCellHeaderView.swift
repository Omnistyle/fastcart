//
//  StoreCellHeaderView.swift
//  FastCart
//
//  Created by Luis Perez on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class StoreCellHeaderView: UICollectionReusableView {
    @IBOutlet var contentView: UIView!
    @IBOutlet var storeName: UILabel!
    @IBOutlet var location: UILabel!
    @IBOutlet var storeImage: UIImageView!
    @IBOutlet var favoriteImage: UIImageView!
    
    var store: Store! {
        didSet {
            storeName.text = store.name
            favoriteImage.image = User.currentUser!.isFavorite(store: store) ? #imageLiteral(resourceName: "heart_filled") : #imageLiteral(resourceName: "heart")
            store.setStoreImage(view: storeImage)
        }
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
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
        let nib = UINib(nibName: "StoreCellHeaderView", bundle: nil)
        nib.instantiate(withOwner: self, options: nil)
        contentView.frame = bounds
        
        storeImage.frame.size.height = storeImage.frame.width
        // Store image rounded corner.
        storeImage.layer.cornerRadius = storeImage.frame.size.width / 2
        storeImage.layer.masksToBounds = true
        favoriteImage.image = #imageLiteral(resourceName: "heart")
        
        addSubview(contentView)
    }
    
}
