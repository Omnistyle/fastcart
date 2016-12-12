//
//  PageContentViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/12/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class PageContentViewController: UIViewController {

    
    @IBOutlet weak var backgroundImage: UIImageView!
    @IBOutlet weak var descriptionLabel: UILabel!
    
    var pageIndex: Int = 0
    var labelTitle: String!
    var photo: UIImage!
    
    let originalWidth = CGFloat(190)
    
    override func viewDidLoad() {
        
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        backgroundImage.image = photo
        descriptionLabel.text = labelTitle
        
       
        
    
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(true)
        // make sure the label shows on top
        descriptionLabel.layer.zPosition = backgroundImage.layer.zPosition + 2
        
        descriptionLabel.frame.origin.y = CGFloat(0) - descriptionLabel.frame.height
        descriptionLabel.center.x = self.view.frame.width / 2
        
        UIView.animateKeyframes(withDuration: 1, delay: 0, options: [], animations: { (success) -> () in
            self.descriptionLabel.frame.origin.y = CGFloat(25)
            
        }, completion: nil)
        
        if pageIndex == 0 {            descriptionLabel.font = UIFont(name: descriptionLabel.font.fontName, size: 25)
            descriptionLabel.frame.size.width = self.view.frame.width
            descriptionLabel.center.x = self.view.frame.width / 2
        } else {
            descriptionLabel.font = UIFont(name: descriptionLabel.font.fontName, size: 17)
            descriptionLabel.frame.size.width = originalWidth
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
