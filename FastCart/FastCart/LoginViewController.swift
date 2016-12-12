//
//  LoginViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 11/14/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import FBSDKLoginKit
import Parse

class LoginViewController: UIViewController, FBSDKLoginButtonDelegate {
    struct Constants {
        static let facebookButtonLeftRightMargin: CGFloat = 16
        static let facebookButtonHeight: CGFloat = 50
        static let facebookButtonBottomMargin: CGFloat = 100
    }

    @IBOutlet weak var usernameLabel: UITextField!
    
    @IBOutlet weak var passwordLabel: UITextField!
    
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    
    @IBOutlet weak var loginButton: UIButton!
    
    @IBOutlet weak var signupButton: UIButton!
    
    var dict : NSDictionary!
    //self.dict = result as NSDictionary
    
    var currentUser : User!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.loginButton.layer.cornerRadius = 5
        self.loginButton.layer.shadowColor = UIColor.gray.cgColor
        self.loginButton.layer.shadowOpacity = 1
        self.loginButton.layer.shadowOffset = CGSize(width: 0, height: 2.0)
        self.loginButton.layer.shadowRadius = 4.0
        self.loginButton.layer.masksToBounds = false

        
        self.signupButton.layer.cornerRadius = 5
        self.signupButton.layer.shadowColor = UIColor.gray.cgColor
        self.signupButton.layer.shadowOpacity = 1
        self.signupButton.layer.shadowOffset = CGSize(width: 0, height: 2.0)
        self.signupButton.layer.shadowRadius = 4.0
        self.signupButton.layer.masksToBounds = false
        
        activityIndicator.hidesWhenStopped = true;
        activityIndicator = Utilities.addActivityIndicator(to: self.view)
        
        let loginButton = FBSDKLoginButton()
        
        let y = self.view.frame.size.height - Constants.facebookButtonBottomMargin
        loginButton.frame = CGRect(x: Constants.facebookButtonLeftRightMargin, y: y,
                                   width: view.frame.width - 2 * Constants.facebookButtonLeftRightMargin,
                                   height: Constants.facebookButtonHeight)
        loginButton.delegate = self
        loginButton.readPermissions = ["email", "public_profile"]
        
        view.addSubview(loginButton)
    }

    
    
    @IBAction func onFastcartLogin(_ sender: Any) {
        let username = self.usernameLabel.text
        let password = self.passwordLabel.text
        activityIndicator.startAnimating()
        PFUser.logInWithUsername (inBackground: username!, password: password!, block: {(user, error) in
            self.activityIndicator.stopAnimating()
            if user != nil {
                //Yes User Exists
                print(user ?? "default message of user logged in")
                let userDictionary = User.getUserDictionary(user: user!)
                let storedUser = User(dictionary: userDictionary)
                storedUser.loginMethod = "parse"
                User.currentUser = storedUser
                
                self.performSegue(withIdentifier: "successloginsegue", sender: nil)

            }
            else {
                let alertController = UIAlertController(title: "Login Failed", message: "Incorrect password or username", preferredStyle: .alert)
                alertController.addAction(UIAlertAction(title: "Try Again", style: UIAlertActionStyle.cancel, handler: nil))
                self.present(alertController, animated: true, completion: nil)
            }
        })
    }
    
    
    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        NotificationCenter.default.post(name: User.userDidLogoutNotification, object: self)
    }
    
    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if error != nil {
            print(error)
            return
        }
        
        FBSDKGraphRequest(graphPath: "/me", parameters: ["fields" : "id, name, email"]).start { (connecion, result, error) in
            if error != nil {
                print("failed to start graph")
                print(error?.localizedDescription ?? "undefined error")
                return
            }
        
            self.dict = result as! NSDictionary
            DispatchQueue.main.async {
                self.onSignUp(username: self.dict["name"] as! String, email: self.dict["email"] as! String, password: "password", id: self.dict["id"] as! String)
            }
        }
        
        self.performSegue(withIdentifier: "successloginsegue", sender: nil)
    }
    
    func onSignUp(username: String, email: String, password: String, id: String) {
        
        let query = PFQuery(className: "AppUsers")
        query.whereKey("email", equalTo: email)
        
        _ = query.findObjectsInBackground{
            (users: [PFObject]?, error: Error?) -> Void in
            if error == nil {
                if users != nil{
                    if (users?.count)! > 0 {
                        //login
                        //var storeUser = User.getParseUser(email: email)
                      
                        let rawUser = users?[0]
                        print(rawUser ?? "printing default rawuser")
                        let userDictionary = User.getUserDictionary(user: rawUser!)
                        let storedUser = User(dictionary: userDictionary)
                        storedUser.loginMethod = "facebook"
                        User.currentUser = storedUser
                        print("user login")
                    
                    }
                    else {
                        //sign up
                        print("user signup")
                        
                        let user = PFObject(className: "AppUsers")
                        user["unsername"] = username
                        user["email"] = email
                        user["facebookId"] = id
                        user.saveInBackground { (succeeded:Bool, error:Error?) in
                            if(succeeded){
                                print("saved with id: \(user.objectId)")
                                
                                let userDic = User.getUserDictionary(user: user)
                                let user = User(dictionary: userDic)
                                user.loginMethod = "facebook"
                                User.currentUser = user
                                
                            } else {
                                print("failed to send message")
                                //print(error?.localizedDescription)
                            }
                        }
                    }
                }
                
            } else {
                print("some went wrong")
            }
            
            self.performSegue(withIdentifier: "successloginsegue", sender: nil)
        }
    }
}
