import React from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import moment from 'moment';
import { fleurimondColors, media } from '../CSS/theme'; // Adjust path to theme

const Footer = () => {
  return (
    <FooterWrapper>
      <FooterContent>
        <FooterGrid>
          <FooterAbout>
            <h3>Fleurimond Productions</h3>
            <p>
              We specialize in capturing stunning visuals and creating
              compelling stories through our photography and cinematography
              services.
            </p>
          </FooterAbout>

          <FooterSocial>
            <h3>Follow Us</h3>
            <SocialIcons>
              <SocialLink
                href='https://www.linkedin.com/in/john-fleurimond/'
                label='LinkedIn'
                icon={FaLinkedin}
              />
              <SocialLink
                href='https://github.com/JOHNFLEURIMOND'
                label='GitHub'
                icon={FaGithub}
              />
            </SocialIcons>
          </FooterSocial>

          <FooterContact>
            <h3>Contact Us</h3>
            <p>617-781-5088</p>
          </FooterContact>
        </FooterGrid>

        <FooterBottomSection>
          <p>
            &copy; {moment().format('YYYY')} Fleurimond Productions. All Rights
            Reserved
          </p>
          <div className='footer-bottom-links'>
            <NavLink to='/privacypolicy'>Privacy Policy</NavLink>
            <NavLink to='/termsconditions'>Terms & Conditions</NavLink>
            <NavLink to='/about'>About Us</NavLink>
            <NavLink to='/photoshoot-inquiry'>Photoshoot Inquiry</NavLink>
            <NavLink to='/deleteuserdata'>Delete User Data</NavLink>
          </div>
        </FooterBottomSection>
      </FooterContent>
    </FooterWrapper>
  );
};

const SocialLink = ({ href, label, icon: Icon }) => (
  <StyledLink
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    aria-label={label}
  >
    <Icon className='icons' />
  </StyledLink>
);

const shakeAnimation = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
`;

const FooterWrapper = styled.div`
  background-color: ${fleurimondColors.midnight}; // Use midnight color for background
  color: ${fleurimondColors.white}; // Use white color for text
  padding: 1rem 0; /* Reduced padding to make the footer thinner */
`;

const FooterContent = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem; /* Reduced padding to make the footer thinner */
`;

const FooterGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr 1fr;

  @media ${media.tablet} {
    grid-template-columns: 1fr;
  }
`;

const FooterAbout = styled.div`
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem; /* Reduced font size for a thinner appearance */
  }

  p {
    font-size: 0.9rem; /* Reduced font size for a thinner appearance */
  }
`;

const FooterSocial = styled.div`
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem; /* Reduced font size for a thinner appearance */
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 0.75rem; /* Reduced gap */
  justify-content: center;
`;

const FooterContact = styled.div`
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem; /* Reduced font size for a thinner appearance */
  }
`;

const FooterBottomSection = styled.div`
  padding: 1rem 2rem; /* Adjusted padding */
  text-align: center;
  background-color: ${fleurimondColors.midnight}; // Use midnight color for background
  color: ${fleurimondColors.white}; // Use white color for text

  .footer-bottom-links {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.75rem; /* Reduced gap */
    justify-content: center;

    a {
      color: ${fleurimondColors.white}; // Use white color for links
      text-decoration: none;
      font-size: 0.9rem; /* Reduced font size for a thinner appearance */
    }

    a:hover {
      text-decoration: underline;
    }
  }
`;

const StyledLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem; /* Reduced padding */
  border-radius: 50%;
  border: 2px solid ${fleurimondColors.white}; // Use white color for border
  transition: all 0.3s ease;

  .icons {
    color: ${fleurimondColors.white}; // Use white color for icons
    font-size: 1.25rem; /* Reduced font size */
  }

  &:hover {
    background-color: ${fleurimondColors.infrared}; // Use infrared color for background on hover
    border-color: ${fleurimondColors.infrared}; // Use infrared color for border on hover
    animation: ${shakeAnimation} 0.6s ease;
    .icons {
      color: ${fleurimondColors.midnight}; // Change icon color to midnight on hover
    }
  }
`;

export default Footer;
