//
//  Reviews.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/15/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ProductReviews: UIView {

    @IBOutlet var contentView: UIView!
    /*
    // Only override draw() if you perform custom drawing.
    // An empty implementation adversely affects performance during animation.
    override func draw(_ rect: CGRect) {
        // Drawing code
    }
    */
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initSubviews()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        initSubviews()
    }
    
    func initSubviews() {
        // standard initialization logic
        let nib = UINib(nibName: "Reviews", bundle: nil)
        nib.instantiate(withOwner: self, options: nil)
        contentView.frame = bounds
        addSubview(contentView)
        
    }

}
