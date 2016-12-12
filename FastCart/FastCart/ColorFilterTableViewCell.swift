//
//  ColorFilterTableViewCell.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

protocol ColorFilterTableViewCellDelegate:class {
    func didSelectColors(cell: ColorFilterTableViewCell, selectedViews: [UIColor])
}

class ColorFilterTableViewCell: UITableViewCell {
    
    weak var delegate: ColorFilterTableViewCellDelegate!
    
    var label = UILabel()
    var colors = [UIView]()
    var colorLabels = [UIColor.red, UIColor.green, UIColor.blue, UIColor.yellow, UIColor.purple, UIColor.black, UIColor.gray, UIColor.white]
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
        
       
    }
    
    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
        
        // Configure the view for the selected state
    }
    
    // MARK: - Init
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        self.backgroundColor = UIColor.clear
        contentView.backgroundColor = UIColor.clear
        
        var count = 0
        let width = CGFloat(40)
        let padding = CGFloat(15)
        //        let padding = (self.contentView.frame.width - CGFloat(4)*width) / CGFloat(6)
        for labelColor in colorLabels {
            let column = CGFloat(Int(count % 4))
            let row = CGFloat(Int(count / 4))
        
            
            
            // calculate frame
            let view = UIView(frame: CGRect(x: padding*(column + 1) + width*column, y: padding*(row + 1) + row*width, width: width , height: width))
            view.backgroundColor = labelColor
            view.layer.cornerRadius = width / 2
            view.layer.masksToBounds = true
            
            let tap = UITapGestureRecognizer(target: self, action: #selector(ColorFilterTableViewCell.colorSelected(sender:)))
            tap.delegate = self
            view.addGestureRecognizer(tap)
            
            
            if labelColor == UIColor.white {
                view.layer.borderWidth = 1
                view.layer.borderColor = UIColor.lightGray.cgColor
            }
            colors.append(view)
            count = count + 1
        }
        
        for view in colors {
            contentView.addSubview(view)
        }
    }
    
    var selectedViews = [UIColor]() {
        didSet {
            delegate.didSelectColors(cell: self, selectedViews: selectedViews)
        }
    }
    
    func colorSelected (sender: UITapGestureRecognizer) {
        guard let color = sender.view?.backgroundColor else {return }
        if selectedViews.contains(color) {
            sender.view?.layer.borderWidth = 0
            if let index = selectedViews.index(of: color) {
                selectedViews.remove(at: index)
            }
            
        } else {
            
            sender.view?.layer.borderWidth = 1
            sender.view?.layer.borderColor = UIColor.black.cgColor
            selectedViews.append(color)
        }
    }
    
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Base Class Overrides
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        label.frame = contentView.bounds
        label.frame.origin.x += 12
        
    }
}
