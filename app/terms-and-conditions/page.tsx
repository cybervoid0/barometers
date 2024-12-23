import { Container, List, ListItem, Text, Title } from '@mantine/core'
import styles from './styles.module.scss'

export const dynamic = 'force-static'

export default function TermsAndConditions() {
  return (
    <Container p="xl">
      <Title mb="md" order={2} component="h2">
        Terms & Conditions for Website Use
      </Title>

      <Text className={styles.paragraph}>
        Welcome to Barometers Realm! Please carefully read these Terms & Conditions (“Terms”) before
        accessing or using the website https://barometers.info (the “Web Site”). By accessing or
        using the Web Site, you agree to comply with and be bound by these Terms, without
        modification. If you do not accept any part of these Terms, you should not use the Web Site.
      </Text>
      <Text className={styles.paragraph}>
        The administration of Barometers Realm (the “Administration”) reserves the right to revise
        or modify these Terms at any time by updating this page. You agree to be bound by any such
        revisions and are encouraged to periodically review the Terms for any updates.
      </Text>

      <Title order={3}>1. Acceptance of the Agreement</Title>

      <Text>
        By using the Web Site, you acknowledge that you have read, understood, and agree to abide by
        all the Terms, Conditions, and Notices outlined in this document or otherwise posted on the
        Web Site (collectively referred to as the “Agreement”). If you do not accept these Terms,
        you are prohibited from using the Web Site.
      </Text>
      <Text>
        Additionally, the content on this Web Site is suitable for all ages, and there are no age
        restrictions for accessing or using the Materials provided here.
      </Text>

      <Title order={3}>2. Intellectual Property and Use of Materials</Title>

      <Text>
        All content on the Web Site, including but not limited to text, graphics, images, audio,
        video, data, coding, scripts, computer programs, and other materials (collectively the
        “Materials”), is protected under copyright laws of the Netherlands and other applicable
        jurisdictions. The Materials are either owned or licensed by the Administration.
      </Text>
      <Text>
        You are granted a limited, personal, non-commercial license to view and download a single
        copy of the Materials solely for personal use. This limited license does not allow you to:
      </Text>
      <List>
        <ListItem>
          Sell, distribute, modify, or create derivative works based on the Materials.
        </ListItem>
        <ListItem>
          Publicly display, perform, or distribute any portion of the Materials for commercial
          purposes.
        </ListItem>
        <ListItem>
          Reproduce, republish, or post the Materials on any other web site, publication, or
          platform without express written permission from the Administration.
        </ListItem>
      </List>
      <Text>
        Unauthorized use of the Materials may result in a violation of copyright, trademark, or
        other applicable laws. Should you breach any of the Terms, your permission to access and use
        the Web Site and Materials will be automatically terminated. Upon termination, you must
        immediately destroy any copies of the Materials you may have obtained.
      </Text>

      <Title order={3}>3. Modification of Terms</Title>

      <Text>
        The Administration reserves the right to modify, revise, or update these Terms at its sole
        discretion, and such changes shall take effect immediately upon posting on this page.
        Continued use of the Web Site constitutes your agreement to any changes in the Terms. It is
        your responsibility to review this page periodically.
      </Text>

      <Title order={3}>4. Prohibited Activities</Title>
      <Text>In addition to unauthorized use of the Materials, you agree not to:</Text>
      <List>
        <ListItem>Use the Web Site for any unlawful purpose.</ListItem>
        <ListItem>
          Attempt to access, modify, or interfere with the Web Site’s functionality or security
          systems.
        </ListItem>
        <ListItem>
          Engage in any activity that could disrupt the performance or compromise the security of
          the Web Site or its users.
        </ListItem>
      </List>

      <Title order={3}>5. Liability Disclaimer</Title>

      <Text>
        The Web Site and its Materials are provided “as is” without warranties of any kind.
        Barometers Realm does not guarantee the accuracy, completeness, or timeliness of the
        information provided on the Web Site. The Administration is not liable for any damages
        resulting from your use or inability to use the Web Site or its content.
      </Text>

      <Title order={3}>6. Governing Law</Title>

      <Text>
        These Terms and your use of the Web Site shall be governed by and construed in accordance
        with the laws of the Netherlands. Any legal actions or disputes arising out of or related to
        these Terms shall be brought exclusively in the courts of the Netherlands.
      </Text>
      <Text>
        By using the Web Site, you agree to these Terms and Conditions. If you have any questions or
        concerns, feel free to contact the Administration of Barometers Realm for clarification.
      </Text>
    </Container>
  )
}
