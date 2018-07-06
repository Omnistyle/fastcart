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

    @IBOutlet weak var signupButton: UIButton!
    
    @IBOutlet weak var loginView: UIImageView!
    
    // navigation bar - get rid of the shadow image
    private var shadowImageView: UIImageView?
    private var activityIndicator: UIActivityIndicatorView!
    
    
   
    
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
        super.viewDidLoad()
        
        activityIndicator = Utilities.addActivityIndicator(to: self.view)
        
        self.signupButton.layer.cornerRadius = 3
        self.signupButton.layer.shadowColor = UIColor.gray.cgColor
        self.signupButton.layer.shadowOpacity = 1
        self.signupButton.layer.shadowOffset = CGSize(width: 0, height: 2.0)
        self.signupButton.layer.shadowRadius = 4.0
        self.signupButton.layer.masksToBounds = false
        
        let tapGestureRecognizer = UITapGestureRecognizer(target:self, action:#selector(SignUpViewController.onTapingOutTextfields))
        loginView.addGestureRecognizer(tapGestureRecognizer)
        loginView.isUserInteractionEnabled = true
    

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

    @objc func onTapingOutTextfields(){
        self.view.endEditing(true)
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
                    Utilities.presentSuccessAlert(title: "Succeeded!", message: "Hooray! Ready to use FastCard?", button: nil, action: nil)
                    let userDictionary = User.getUserDictionary(user: newUser)
                    let newUser = User(dictionary: userDictionary)
                    newUser.loginMethod = "parse"
                    User.currentUser = newUser
                    self.performSegue(withIdentifier: "successsignupsegue", sender: nil)
                }
                else{
                    Utilities.presentErrorAlert(title: "Failed!", message: "Failed to sign-up :(")
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
        vc.customInitialize()
    }
}
