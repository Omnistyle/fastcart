//
//  SignUpViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 12/10/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import Parse

class SignUpViewController: UIViewController {

    @IBOutlet weak var emailLabel: UITextField!
    
    @IBOutlet weak var usernameLabel: UITextField!
    
    @IBOutlet weak var passwordLabel: UITextField!
    
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!

    @IBOutlet weak var signupButton: UIButton!
    
    @IBOutlet weak var loginView: UIImageView!
    
    // navigation bar - get rid of the shadow image
    private var shadowImageView: UIImageView?
    
    private func findShadowImage(under view: UIView) -> UIImageView? {
        if view is UIImageView && view.bounds.size.height <= 1 {
            return (view as! UIImageView)
        }
        
        for subview in view.subviews {
            if let imageView = findShadowImage(under: subview) {
                return imageView
            }
        }
        return nil
    }
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if shadowImageView == nil {
            shadowImageView = findShadowImage(under: navigationController!.navigationBar)
        }
        shadowImageView?.isHidden = true
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        shadowImageView?.isHidden = false
    }

    
    override func viewDidLoad() {
        
        activityIndicator.hidesWhenStopped = true;
        activityIndicator.activityIndicatorViewStyle  = UIActivityIndicatorViewStyle.gray;
        //activityIndicator.center = view.center;
        
        self.signupButton.layer.cornerRadius = 3
        self.signupButton.layer.shadowColor = UIColor.gray.cgColor
        self.signupButton.layer.shadowOpacity = 1
        self.signupButton.layer.shadowOffset = CGSize(width: 0, height: 2.0)
        self.signupButton.layer.shadowRadius = 4.0
        self.signupButton.layer.masksToBounds = false
        
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        // add blur effect
        let blurEffect = UIBlurEffect(style: UIBlurEffectStyle.light)
        let blurEffectView = UIVisualEffectView(effect: blurEffect)
        blurEffectView.frame = loginView.bounds
        blurEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        loginView.addSubview(blurEffectView)
        
        // format navigation bar
        self.navigationController?.navigationBar.backgroundColor = UIColor.clear
        self.navigationController?.navigationBar.tintColor = UIColor.lightGray
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onBackLogin(_ sender: Any) {
        self.dismiss(animated: true, completion: ({}))
    }
    
    
    @IBAction func onSignUp(_ sender: Any) {
        let username = self.usernameLabel.text
        let password = self.passwordLabel.text
        let email = self.emailLabel.text
        
        if (username?.characters.count)! < 5 {
            Utilities.presentErrorAlert(title: "Invalid", message: "Username must be greater than 5 characters.")
            
        } else if (password?.characters.count)! < 8 {
            Utilities.presentErrorAlert(title: "Invalid", message: "Password must be greater than 8 characters.")
            
        } else if (email?.characters.count)! < 8 {
            Utilities.presentErrorAlert(title: "Invalid", message: "Please enter a valid email address.")
            
        } else {
            activityIndicator.startAnimating()
            let newUser = PFUser()
            newUser.username = username
            newUser.password = password
            newUser.email = email
            
            // Sign up the user asynchronously
            newUser.signUpInBackground { (succeeded : Bool, error : Error?) in
                self.activityIndicator.stopAnimating()
                if(succeeded){
                    let alertController = UIAlertController(title: "Succedded", message: "Hooray! Ready to use FastCart.", preferredStyle: .alert)
                    let OKAction = UIAlertAction(title: "OK", style: .default) { (action) in
                        // handle response here.
                    }
                    
                    alertController.addAction(OKAction)

                    let userDictionary = User.getUserDictionary(user: newUser)
                    let newUser = User(dictionary: userDictionary)
                    newUser.loginMethod = "parse"
                    User.currentUser = newUser

                    self.performSegue(withIdentifier: "successsignupsegue", sender: nil)
                    
                }
                else{
                    let alertController = UIAlertController(title: "Failed", message: "failed to sign up", preferredStyle: .alert)
                    let cancelAction = UIAlertAction(title: "OK", style: .cancel) { (action) in
                        // handle cancel response here. Doing nothing will dismiss the view.
                    }
                    alertController.addAction(cancelAction)
                }
            }
        }
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        
        
        guard let vc = segue.destination as? UITabBarController else {return }
        let tabBar = vc.tabBar as UITabBar
        let tabBarItem1 = tabBar.items![0] as UITabBarItem
        let tabBarItem2 = tabBar.items![1] as UITabBarItem
        let tabBarItem3 = tabBar.items![2] as UITabBarItem
        let tabBarItem4 = tabBar.items![3] as UITabBarItem
        let tabBarItem5 = tabBar.items![4] as UITabBarItem
        
        
        print("App delegate running!")
        tabBarItem1.selectedImage = #imageLiteral(resourceName: "store_filled")
        tabBarItem2.selectedImage = #imageLiteral(resourceName: "camera_filled")
        tabBarItem3.selectedImage = #imageLiteral(resourceName: "bag_filled")
        tabBarItem4.selectedImage = #imageLiteral(resourceName: "credit_card_filled_final")
        tabBarItem5.selectedImage = #imageLiteral(resourceName: "profile_filled")
        
        // nonselected color to black
        for tabItem in tabBar.items! {
            let item = tabItem
            item.image = item.image?.withRenderingMode(.alwaysOriginal)
            item.setTitleTextAttributes(["NSForegroundColorAttributeName":UIColor.black], for: .normal)
            // change the iimage insets to only have the image
            item.imageInsets = UIEdgeInsets(top: 7, left: 0, bottom: -7, right: 0)
        }
        
        // change tint color to black
        UITabBar.appearance().tintColor = UIColor.black
        UINavigationBar.appearance().tintColor = UIColor.black
        
    }
}
